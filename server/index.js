import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 8787)
const dataDir = path.join(__dirname, 'data')
const quotesFile = path.join(dataDir, 'quotes.json')
const rateMap = new Map()

app.use(express.json({ limit: '120kb' }))
app.disable('x-powered-by')

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true })
  try { await fs.access(quotesFile) } catch { await fs.writeFile(quotesFile, '[]\n', 'utf8') }
}

function safeText(value, max = 600) {
  return String(value ?? '').trim().slice(0, max)
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function rateLimited(ip) {
  const now = Date.now()
  const recent = (rateMap.get(ip) || []).filter(t => now - t < 10 * 60 * 1000)
  if (recent.length >= 6) return true
  recent.push(now)
  rateMap.set(ip, recent)
  return false
}

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'sable-configurator-api' }))

app.post('/api/quotes', async (req, res) => {
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many requests. Please try again later.' })

  const customer = req.body?.customer || {}
  const configuration = req.body?.configuration || {}
  const name = safeText(customer.name, 120)
  const email = safeText(customer.email, 180).toLowerCase()
  if (name.length < 2 || !validEmail(email)) return res.status(400).json({ error: 'A valid name and email are required.' })

  const quote = {
    id: crypto.randomUUID(),
    reference: `S01-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    createdAt: new Date().toISOString(),
    customer: {
      name,
      email,
      phone: safeText(customer.phone, 60),
      city: safeText(customer.city, 100),
      notes: safeText(customer.notes, 1200)
    },
    configuration: {
      paint: safeText(configuration.paint, 120),
      wheels: safeText(configuration.wheels, 120),
      interior: safeText(configuration.interior, 120),
      caliper: safeText(configuration.caliper, 120),
      price: Number(configuration.price || 0)
    },
    status: 'new'
  }

  await ensureStore()
  const quotes = JSON.parse(await fs.readFile(quotesFile, 'utf8'))
  quotes.unshift(quote)
  await fs.writeFile(quotesFile, JSON.stringify(quotes, null, 2) + '\n', 'utf8')
  res.status(201).json({ ok: true, reference: quote.reference })
})

app.get('/api/quotes', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey || req.header('x-admin-key') !== adminKey) return res.status(401).json({ error: 'Unauthorized' })
  await ensureStore()
  res.json(JSON.parse(await fs.readFile(quotesFile, 'utf8')))
})

app.patch('/api/quotes/:id', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey || req.header('x-admin-key') !== adminKey) return res.status(401).json({ error: 'Unauthorized' })
  const allowed = new Set(['new', 'contacted', 'quoted', 'closed'])
  const nextStatus = safeText(req.body?.status, 30)
  if (!allowed.has(nextStatus)) return res.status(400).json({ error: 'Invalid status' })
  await ensureStore()
  const quotes = JSON.parse(await fs.readFile(quotesFile, 'utf8'))
  const index = quotes.findIndex(q => q.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Quote not found' })
  quotes[index].status = nextStatus
  quotes[index].updatedAt = new Date().toISOString()
  await fs.writeFile(quotesFile, JSON.stringify(quotes, null, 2) + '\n', 'utf8')
  res.json({ ok: true, quote: quotes[index] })
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist')
  app.use(express.static(dist, { maxAge: '1h' }))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) return res.sendFile(path.join(dist, 'index.html'))
    next()
  })
}

ensureStore().then(() => {
  app.listen(port, () => console.log(`SABLE API listening on http://localhost:${port}`))
})
