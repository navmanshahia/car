import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export default function QuoteModal({ open, onClose, config, price }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', notes: '' })
  const [status, setStatus] = useState('idle')
  const [reference, setReference] = useState('')

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const response = await fetch('/car/api/quotes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          configuration: {
            paint: config.paint.name,
            wheels: `${config.wheel.name} ${config.wheel.size}`,
            interior: config.interior.name,
            caliper: config.caliper.name,
            price
          }
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to submit')
      setReference(data.reference)
      setStatus('sent')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className="quote-modal" initial={{ opacity: 0, y: 40, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: .98 }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} onMouseDown={e => e.stopPropagation()}>
            <button className="modal-close" type="button" onClick={onClose}>Close ×</button>
            {status !== 'sent' ? (
              <>
                <div className="modal-kicker">Private commission request</div>
                <h2>Take this specification<br /><em>off the screen.</em></h2>
                <div className="quote-spec">
                  <div><span>Exterior</span><strong>{config.paint.name}</strong></div>
                  <div><span>Wheels</span><strong>{config.wheel.name} · {config.wheel.size}</strong></div>
                  <div><span>Cabin</span><strong>{config.interior.name}</strong></div>
                  <div><span>Indicative</span><strong>${price.toLocaleString('en-CA')} CAD</strong></div>
                </div>
                <form onSubmit={submit}>
                  <div className="form-row"><label><span>Name *</span><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" /></label><label><span>Email *</span><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@email.com" /></label></div>
                  <div className="form-row"><label><span>Phone</span><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1" /></label><label><span>City</span><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Vancouver" /></label></div>
                  <label><span>Commission notes</span><textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Timing, trade-in, custom colour reference…" /></label>
                  <button className="submit-commission" disabled={status === 'sending'}>{status === 'sending' ? 'Sending request…' : 'Request private quote'}<i>↗</i></button>
                  {status === 'error' && <p className="form-error">The request could not be sent. Please check the server and try again.</p>}
                </form>
              </>
            ) : (
              <div className="success-state">
                <span className="success-mark">✓</span>
                <div className="modal-kicker">Commission received</div>
                <h2>Your S·01 is now<br /><em>a real brief.</em></h2>
                <p>Reference <strong>{reference}</strong>. A specialist can now follow up using the details you submitted.</p>
                <button className="submit-commission" type="button" onClick={onClose}>Return to configurator <i>↗</i></button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
