import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem('sable-admin-key') || '')
  const [draftKey, setDraftKey] = useState('')
  const [quotes, setQuotes] = useState([])
  const [status, setStatus] = useState(key ? 'loading' : 'locked')
  const [error, setError] = useState('')

  async function loadQuotes(adminKey = key) {
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/quotes', { headers: { 'x-admin-key': adminKey } })
      if (!res.ok) throw new Error('Invalid admin key or server unavailable.')
      const data = await res.json()
      setQuotes(data)
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('locked')
      sessionStorage.removeItem('sable-admin-key')
      setKey('')
    }
  }

  useEffect(() => { if (key) loadQuotes(key) }, [])

  async function login(e) {
    e.preventDefault()
    sessionStorage.setItem('sable-admin-key', draftKey)
    setKey(draftKey)
    await loadQuotes(draftKey)
  }

  async function updateStatus(id, nextStatus) {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ status: nextStatus })
    })
    if (res.ok) setQuotes(items => items.map(q => q.id === id ? { ...q, status: nextStatus } : q))
  }

  if (status === 'locked') {
    return <main className="admin-shell admin-login">
      <div className="admin-login-card">
        <a href="/" className="brand"><strong>SABLE</strong><span>/ COMMISSION DESK</span></a>
        <div className="modal-kicker">Protected access</div>
        <h1>Commission<br/><em>inbox.</em></h1>
        <form onSubmit={login}>
          <label><span>Admin key</span><input type="password" value={draftKey} onChange={e => setDraftKey(e.target.value)} placeholder="Enter ADMIN_KEY" required /></label>
          <button className="submit-commission">Open commission desk <i>↗</i></button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
    </main>
  }

  return <main className="admin-shell">
    <header className="admin-topbar">
      <a href="/" className="brand"><strong>SABLE</strong><span>/ COMMISSION DESK</span></a>
      <div className="admin-actions"><span>{quotes.length} commissions</span><button onClick={() => loadQuotes()}>Refresh</button><button onClick={() => { sessionStorage.removeItem('sable-admin-key'); location.reload() }}>Lock</button></div>
    </header>
    <section className="admin-intro">
      <div><div className="modal-kicker">Private client requests</div><h1>Commission<br/><em>inbox.</em></h1></div>
      <p>Every quote request submitted through the S·01 configurator appears here with the exact vehicle specification.</p>
    </section>
    {status === 'loading' ? <div className="admin-empty">Loading commissions…</div> : quotes.length === 0 ? <div className="admin-empty">No commissions yet.</div> : (
      <section className="quote-list">
        {quotes.map(q => <article className="admin-quote" key={q.id}>
          <div className="quote-card-head"><div><small>{q.reference}</small><h2>{q.customer.name}</h2></div><select value={q.status} onChange={e => updateStatus(q.id, e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="closed">Closed</option></select></div>
          <div className="admin-spec-grid"><div><span>Paint</span><strong>{q.configuration.paint}</strong></div><div><span>Wheels</span><strong>{q.configuration.wheels}</strong></div><div><span>Cabin</span><strong>{q.configuration.interior}</strong></div><div><span>Indicative</span><strong>${Number(q.configuration.price || 0).toLocaleString('en-CA')} CAD</strong></div></div>
          <div className="contact-strip"><a href={`mailto:${q.customer.email}`}>{q.customer.email}</a>{q.customer.phone && <a href={`tel:${q.customer.phone}`}>{q.customer.phone}</a>}{q.customer.city && <span>{q.customer.city}</span>}<time>{new Date(q.createdAt).toLocaleString()}</time></div>
          {q.customer.notes && <p className="admin-notes">“{q.customer.notes}”</p>}
        </article>)}
      </section>
    )}
  </main>
}
