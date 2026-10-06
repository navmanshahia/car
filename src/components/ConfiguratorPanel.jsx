import { motion } from 'framer-motion'
import { CALIPERS, INTERIORS, PAINTS, VIEWS, WHEELS } from '../data/options'

function ChoiceSwatch({ active, title, subtitle, onClick, children }) {
  return (
    <button className={`choice-card ${active ? 'active' : ''}`} onClick={onClick} type="button">
      <span className="choice-visual">{children}</span>
      <span className="choice-copy">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
    </button>
  )
}

export default function ConfiguratorPanel({ tab, setTab, config, setConfig, view, setView, scene, setScene, price }) {
  return (
    <motion.aside className="config-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .65 }}>
      <div className="config-head">
        <div>
          <small>Commission No. S01–A</small>
          <h2>S·01 Atelier</h2>
        </div>
        <div className="price-block">
          <small>Configured from</small>
          <strong>${price.toLocaleString('en-CA')} CAD</strong>
        </div>
      </div>

      <nav className="config-tabs" aria-label="Configurator categories">
        {['paint', 'wheels', 'cabin', 'view'].map((id) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{id}</button>
        ))}
      </nav>

      <div className="config-content">
        {tab === 'paint' && (
          <div className="choice-grid">
            {PAINTS.map((p) => <ChoiceSwatch key={p.id} active={config.paint.id === p.id} title={p.name} subtitle={p.price ? `+$${p.price.toLocaleString()}` : 'Included'} onClick={() => setConfig(c => ({ ...c, paint: p }))}><span className="paint-dot" style={{ background: p.color }} /></ChoiceSwatch>)}
          </div>
        )}
        {tab === 'wheels' && (
          <div className="choice-grid wheels-grid">
            {WHEELS.map((w) => <ChoiceSwatch key={w.id} active={config.wheel.id === w.id} title={w.name} subtitle={`${w.size}${w.price ? ` · +$${w.price.toLocaleString()}` : ''}`} onClick={() => setConfig(c => ({ ...c, wheel: w }))}><span className={`wheel-icon wheel-${w.id}`}><i /></span></ChoiceSwatch>)}
          </div>
        )}
        {tab === 'cabin' && (
          <>
            <div className="section-label">Upholstery</div>
            <div className="choice-grid">
              {INTERIORS.map((i) => <ChoiceSwatch key={i.id} active={config.interior.id === i.id} title={i.name} subtitle={i.price ? `+$${i.price.toLocaleString()}` : 'Included'} onClick={() => setConfig(c => ({ ...c, interior: i }))}><span className="interior-dot" style={{ background: `linear-gradient(135deg, ${i.color} 0 50%, ${i.accent} 50%)` }} /></ChoiceSwatch>)}
            </div>
            <div className="section-label caliper-label">Brake caliper</div>
            <div className="mini-row">
              {CALIPERS.map(c => <button key={c.id} className={config.caliper.id === c.id ? 'active' : ''} type="button" onClick={() => setConfig(v => ({ ...v, caliper: c }))}><span style={{ background: c.color }} />{c.name}</button>)}
            </div>
          </>
        )}
        {tab === 'view' && (
          <>
            <div className="section-label">Camera</div>
            <div className="view-grid">
              {VIEWS.map(v => <button key={v.id} type="button" className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}><span>{v.label}</span><i>↗</i></button>)}
            </div>
            <div className="section-label scene-label">Studio mood</div>
            <div className="scene-switch">
              {['gallery', 'dusk', 'blackroom'].map(s => <button key={s} type="button" className={scene === s ? 'active' : ''} onClick={() => setScene(s)}>{s}</button>)}
            </div>
          </>
        )}
      </div>
    </motion.aside>
  )
}
