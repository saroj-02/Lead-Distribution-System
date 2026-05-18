import { useState } from 'react';

export default function TestTools(){
  const [msg,setMsg]=useState('');

  async function resetQuota(){
    const id = 'evt-'+Date.now();
    const res = await fetch('/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId:id,action:'reset_quota'})});
    const j = await res.json(); setMsg(JSON.stringify(j));
  }

  async function callWebhookMultiple(){
    const id = 'evt-duplicate';
    const calls = [];
    for(let i=0;i<3;i++) calls.push(fetch('/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId:id,action:'reset_quota'})}));
    const res = await Promise.all(calls);
    setMsg('calls: '+res.map(r=>r.status).join(','));
  }

  async function generate10(){
    const res = await fetch('/api/test/generate-bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:10})});
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')){
      const j = await res.json(); setMsg(JSON.stringify(j));
    } else {
      const txt = await res.text(); setMsg('Non-JSON response: '+txt);
    }
  }

  return (
    <div>
      <div className="hero">
        <h2>Test Tools</h2>
        <p className="muted">Webhook simulator and concurrency tester for quota/reset behaviour.</p>
      </div>

      <div className="card" style={{marginTop:12,display:'flex',gap:12,flexWrap:'wrap'}}>
        <div style={{flex:1}}>
          <button style={{width:'100%'}} onClick={resetQuota}>Reset provider quota to 10 (webhook)</button>
        </div>
        <div style={{flex:1}}>
          <button className="secondary" style={{width:'100%'}} onClick={callWebhookMultiple}>Call webhook multiple times</button>
        </div>
        <div style={{flex:1}}>
          <button style={{width:'100%'}} onClick={generate10}>Generate 10 leads concurrently</button>
        </div>
      </div>

      <div style={{marginTop:12}} className="card">
        <strong>Result</strong>
        <pre style={{whiteSpace:'pre-wrap'}}>{msg}</pre>
      </div>
    </div>
  )
}
