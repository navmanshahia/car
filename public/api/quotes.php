<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const DATA_FILE = __DIR__ . '/data/quotes.json';
const LOCAL_CONFIG = __DIR__ . '/config.local.php';

if (file_exists(LOCAL_CONFIG)) {
    require LOCAL_CONFIG;
}

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function body(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function clean($value, int $max = 600): string {
    $value = trim((string)($value ?? ''));
    return mb_substr($value, 0, $max);
}

function admin_key(): string {
    if (defined('SABLE_ADMIN_KEY')) return (string) SABLE_ADMIN_KEY;
    $env = getenv('SABLE_ADMIN_KEY');
    return $env === false ? '' : (string)$env;
}

function request_header(string $name): string {
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return isset($_SERVER[$key]) ? (string)$_SERVER[$key] : '';
}

function require_admin(): void {
    $configured = admin_key();
    $provided = request_header('x-admin-key');
    if ($configured === '' || !hash_equals($configured, $provided)) {
        respond(401, ['error' => 'Unauthorized']);
    }
}

function read_quotes(): array {
    if (!is_dir(dirname(DATA_FILE))) mkdir(dirname(DATA_FILE), 0755, true);
    if (!file_exists(DATA_FILE)) file_put_contents(DATA_FILE, "[]\n", LOCK_EX);
    $raw = file_get_contents(DATA_FILE);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function write_quotes(array $quotes): void {
    $json = json_encode($quotes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
    if (file_put_contents(DATA_FILE, $json, LOCK_EX) === false) {
        respond(500, ['error' => 'Unable to save quote']);
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $input = body();
    $customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
    $configuration = is_array($input['configuration'] ?? null) ? $input['configuration'] : [];

    $name = clean($customer['name'] ?? '', 120);
    $email = strtolower(clean($customer['email'] ?? '', 180));
    if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(400, ['error' => 'A valid name and email are required.']);
    }

    $id = bin2hex(random_bytes(16));
    $reference = 'S01-' . strtoupper(substr(base_convert((string)time(), 10, 36), -6));
    $quote = [
        'id' => $id,
        'reference' => $reference,
        'createdAt' => gmdate('c'),
        'customer' => [
            'name' => $name,
            'email' => $email,
            'phone' => clean($customer['phone'] ?? '', 60),
            'city' => clean($customer['city'] ?? '', 100),
            'notes' => clean($customer['notes'] ?? '', 1200),
        ],
        'configuration' => [
            'paint' => clean($configuration['paint'] ?? '', 120),
            'wheels' => clean($configuration['wheels'] ?? '', 120),
            'interior' => clean($configuration['interior'] ?? '', 120),
            'caliper' => clean($configuration['caliper'] ?? '', 120),
            'price' => (float)($configuration['price'] ?? 0),
        ],
        'status' => 'new',
    ];

    $quotes = read_quotes();
    array_unshift($quotes, $quote);
    write_quotes($quotes);
    respond(201, ['ok' => true, 'reference' => $reference]);
}

if ($method === 'GET') {
    require_admin();
    respond(200, read_quotes());
}

if ($method === 'PATCH') {
    require_admin();
    $id = clean($_GET['id'] ?? '', 80);
    $input = body();
    $next = clean($input['status'] ?? '', 30);
    $allowed = ['new', 'contacted', 'quoted', 'closed'];
    if ($id === '' || !in_array($next, $allowed, true)) respond(400, ['error' => 'Invalid request']);

    $quotes = read_quotes();
    $found = false;
    foreach ($quotes as &$quote) {
        if (($quote['id'] ?? '') === $id) {
            $quote['status'] = $next;
            $quote['updatedAt'] = gmdate('c');
            $found = true;
            break;
        }
    }
    unset($quote);
    if (!$found) respond(404, ['error' => 'Quote not found']);
    write_quotes($quotes);
    respond(200, ['ok' => true]);
}

respond(405, ['error' => 'Method not allowed']);
