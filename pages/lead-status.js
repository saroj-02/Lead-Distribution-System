import { useState } from 'react';

export default function LeadStatus() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function search(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/lead-by-phone?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="hero">
        <h2>Track Your Lead</h2>
        <p className="muted">Enter your phone number to view current lead status and provider updates.</p>
      </div>

      <div className="card" style={{marginTop:16}}>
        <form onSubmit={search}>
          <div className="form-row">
            <div className="col"><input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
            <div>
              <button disabled={loading}>{loading ? 'Searching...' : 'Search Leads'}</button>
            </div>
          </div>
        </form>
      </div>

      {result && (
        <div style={{marginTop:16}}>
          {result.error && (
            <div className="card" style={{background:'rgba(244,63,94,0.12)',border:'1px solid rgba(244,63,94,0.24)'}}>
              <strong>Error:</strong> {result.error}
            </div>
          )}
          {Array.isArray(result.leads) && result.leads.length === 0 && (
            <div className="card">
              No leads found for this phone number.
            </div>
          )}
          {Array.isArray(result.leads) && result.leads.map(lead => (
            <div key={lead._id} className="card" style={{marginTop:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:18,fontWeight:700}}>{lead.service?.name || 'Unknown Service'}</div>
                  <div className="muted">Status: <strong>{lead.status}</strong></div>
                </div>
                <div className="muted">Created: {new Date(lead.createdAt).toLocaleString()}</div>
              </div>
              <div style={{marginTop:12}}>
                <div><strong>Assigned Providers:</strong></div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                  {lead.assignedProviders.map(provider => (
                    <span key={provider._id} style={{padding:'6px 10px',borderRadius:8,background:'rgba(255,255,255,0.06)'}}>{provider.name}</span>
                  ))}
                </div>
              </div>
              <div style={{marginTop:12}}>
                <strong>Description</strong>
                <p className="muted">{lead.description || 'No description provided.'}</p>
              </div>
              <div style={{marginTop:12}}>
                <strong>Status History</strong>
                <ul style={{marginTop:8}}>
                  {(lead.statusHistory || []).map((entry, index) => (
                    <li key={index} style={{marginBottom:6}}>
                      <strong>{entry.status}</strong> at {new Date(entry.changedAt).toLocaleString()}
                      {entry.note ? <div className="muted" style={{marginTop:4}}>{entry.note}</div> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
