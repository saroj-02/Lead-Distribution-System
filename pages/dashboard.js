import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Dashboard(){
  const [providers, setProviders] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(()=>{
    const role = (typeof window !== 'undefined') ? localStorage.getItem('pw_auth_role') : null;
    if(role !== 'provider'){
      // if not provider, redirect to home after short delay
      setTimeout(()=> router.replace('/'), 600);
    }
  },[]);

  async function load(){
    try {
      const res = await fetch('/api/dashboard-data');
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')){
        const j = await res.json();
        setProviders(j.providers || []);
      } else {
        const txt = await res.text();
        console.error('Non-JSON dashboard-data response', txt);
        setProviders([]);
      }
    } catch (err) {
      console.error('Failed to load dashboard-data', err);
      setProviders([]);
    }
  }

  useEffect(()=>{
    load();
    const es = new EventSource('/api/events');
    es.onmessage = (e)=>{ load(); }
    return ()=> es.close();
  },[]);

  async function updateLeadStatus(leadId, status) {
    try {
      const res = await fetch('/api/lead-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, status }) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unable to update status');
      }
      await load();
    } catch (err) {
      console.error('Status update failed', err);
      alert('Unable to update lead status: ' + err.message);
    }
  }

  return (
    <div>
      <div className="hero">
        <h2>Provider Dashboard</h2>
        <p className="muted">Live view of provider quotas and assigned leads.</p>
      </div>

      <div className="grid cols-3" style={{marginTop:12}}>
        {providers.map(p=> (
          <div key={p._id} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div className="provider-name">{p.name}</div>
                <div className="muted">Quota remaining: {p.monthlyQuota - p.monthlyAssigned}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700,fontSize:18}}>{p.leadsCount}</div>
                <div className="muted">Leads received</div>
              </div>
            </div>

            <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,0.03)',margin:'12px 0'}} />
            <div>
              <strong className="muted">Assigned leads</strong>
              <ul style={{marginTop:8}}>
                {(p.leads||[]).slice(-5).map(l=> (
                  <li key={l._id} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                      <div>
                        <div style={{fontWeight:600}}>{l.name} — {l.phone}</div>
                        <div className="muted">{l.service?.name || ''} · Status: <strong>{l.status}</strong></div>
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {l.status === 'assigned' && <button className="secondary" type="button" onClick={()=>updateLeadStatus(l._id,'accepted')}>Accept</button>}
                        {l.status === 'accepted' && <button className="secondary" type="button" onClick={()=>updateLeadStatus(l._id,'contacted')}>Mark Contacted</button>}
                        {l.status === 'contacted' && <button className="secondary" type="button" onClick={()=>updateLeadStatus(l._id,'closed')}>Close Lead</button>}
                      </div>
                    </div>
                    <div style={{marginTop:6}}><span className="muted">{l.description}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
