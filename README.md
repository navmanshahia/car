# SABLE / S·01 — Luxury 3D Car Configurator

A full-stack fictional luxury automotive configurator with an original “private digital coachbuilder” identity.

## What works
- Live React Three Fiber / Three.js vehicle scene
- Pointer-reactive camera + cinematic camera presets
- Exterior paint switching
- Three wheel treatments with 3D geometry changes
- Interior upholstery switching
- Brake caliper colour switching
- Cockpit / exterior / rear / detail camera modes
- Gallery / dusk / blackroom studio environments
- Dynamic indicative pricing
- Quote request modal
- Express API with validation and basic rate limiting
- Persistent quote storage to JSON
- Protected quote list endpoint via `ADMIN_KEY`
- Protected `/admin` commission inbox with New → Contacted → Quoted → Closed status workflow
- Responsive mobile layout + reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:8787`

## Production

```bash
npm install
npm run build
ADMIN_KEY="your-long-secret" npm start
```

Then open the port exposed by your hosting provider. The Express server serves the compiled frontend from `dist/`.

## API

### Create quote
`POST /api/quotes`

### Health
`GET /api/health`

### Admin commission desk
Open `/admin` and enter the same `ADMIN_KEY` configured on the server. The dashboard can review submissions and update lead status.

### Read quotes directly
`GET /api/quotes` with header:

```text
x-admin-key: your ADMIN_KEY
```

## Replace the procedural concept with a real GLB
The current S·01 is an original procedural concept made from Three.js geometry, so the configurator works immediately without licensed car assets. A production automotive brand can replace the `Car` component with a compressed `.glb/.gltf` model while keeping the exact configurator state, materials and UI architecture.
