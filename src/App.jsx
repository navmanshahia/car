import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CarScene from './components/CarScene'
import ConfiguratorPanel from './components/ConfiguratorPanel'
import QuoteModal from './components/QuoteModal'
import StorySections from './components/StorySections'
import AdminPage from './components/AdminPage'
import { BASE_PRICE, CALIPERS, INTERIORS, PAINTS, WHEELS } from './data/options'

function ConfiguratorSite() {
  const [config, setConfig] = useState({ paint: PAINTS[0], wheel: WHEELS[0], interior: INTERIORS[0], caliper: CALIPERS[0] })
  const [tab, setTab] = useState('paint')
  const [view, setView] = useState('exterior')
  const [scene, setScene] = useState('gallery')
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [intro, setIntro] = useState(true)

  const price = useMemo(() => BASE_PRICE + config.paint.price + config.wheel.price + config.interior.price + config.caliper.price, [config])

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1150)
    const move = e => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', move)
    return () => { clearTimeout(t); window.removeEventListener('pointermove', move) }
  }, [])

  const copySpec = async () => {
    const spec = `SABLE S·01 — ${config.paint.name}, ${config.wheel.name}, ${config.interior.name}, ${config.caliper.name} calipers — $${price.toLocaleString('en-CA')} CAD`
    try { await navigator.clipboard.writeText(spec) } catch {}
  }

  return (
    <main className="site-shell">
      {intro && <motion.div className="intro-screen" initial={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="intro-mark">SABLE<span>/</span></div><div className="intro-line"><i /></div><small>Motor Atelier</small></motion.div>}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Sable Motor Atelier"><strong>SABLE</strong><span>/ MOTOR ATELIER</span></a>
        <div className="top-status"><span className="status-dot" /> S·01 CONFIGURATOR</div>
        <nav><a href="#story">Atelier</a><button type="button" onClick={() => setQuoteOpen(true)}>Request quote <span>↗</span></button></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <motion.div className="kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>THE S·01 / DIGITAL COMMISSION</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: .8 }}>
            A machine<br /><em>composed,</em> not configured.
          </motion.h1>
        </div>
        <div className="hero-stage">
          <CarScene config={config} view={view} scene={scene} />
          <div className="stage-meta left-meta"><span>DRAG / EXPLORE</span><small>Live 3D study</small></div>
          <div className="stage-meta right-meta"><span>{config.paint.name}</span><small>{config.wheel.name} · {config.wheel.size}</small></div>
        </div>
        <ConfiguratorPanel tab={tab} setTab={setTab} config={config} setConfig={setConfig} view={view} setView={setView} scene={scene} setScene={setScene} price={price} />
        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={() => setQuoteOpen(true)}>Commission this specification <span>↗</span></button>
          <button className="ghost-action" type="button" onClick={copySpec}>Copy specification <span>⌁</span></button>
        </div>
      </section>

      <section id="story"><StorySections /></section>

      <footer>
        <div className="footer-brand">SABLE<span>/</span></div>
        <p>A fictional automotive experience designed as a private digital coachbuilder.</p>
        <div><span>S·01 / 2026</span><button type="button" onClick={() => setQuoteOpen(true)}>Begin a commission ↗</button></div>
      </footer>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} config={config} price={price} />
    </main>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return (path === '/admin' || path === '/car/admin') ? <AdminPage /> : <ConfiguratorSite />
}
