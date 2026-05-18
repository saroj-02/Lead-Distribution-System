import { useState, useEffect } from 'react';

export default function RequestService(){
  const [services,setServices] = useState([]);
  const [form,setForm]=useState({name:'',phone:'',city:'',description:'',serviceCode:1});
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState(null);

  useEffect(() => {
    async function loadServices(){
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (Array.isArray(data.services) && data.services.length) {
          setServices(data.services);
          setForm(prev => ({ ...prev, serviceCode: data.services[0].code }));
        }
      } catch (err) {
        console.error('Failed to load services', err);
      }
    }
    loadServices();
  }, []);

  async function submit(e){
    e.preventDefault();
    setBusy(true); setResult(null);
    try{
      const res = await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const ct = res.headers.get('content-type') || '';
      let payload;
      if (ct.includes('application/json')) {
        payload = await res.json();
      } else {
        const txt = await res.text();
        payload = { error: `Unexpected response (${res.status})`, detail: txt };
      }

      if (res.ok) {
        setResult({
          status: 'success',
          message: 'Lead submitted successfully.',
          lead: payload.lead
        });
        setForm({name:'',phone:'',city:'',description:'',serviceCode:services[0]?.code || 1});
      } else {
        setResult({
          status: 'error',
          message: payload.error || 'Submission failed.',
          detail: payload.detail || JSON.stringify(payload)
        });
      }
    } catch(err) {
      setResult({ status:'error', message:'Request failed.', detail: err.message });
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="hero">
        <h2>Request Service</h2>
        <p className="muted">Fill the enquiry — leads are assigned fairly and in real-time.</p>
      </div>

      <div className="card" style={{marginTop:12}}>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="col"><input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
            <div className="col"><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
          </div>

          <div className="form-row">
            <div className="col"><input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></div>
            <div className="col">
              <select value={form.serviceCode} onChange={e=>setForm({...form,serviceCode:Number(e.target.value)})}>
                {services.map(s=> <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>

          <div style={{marginTop:10}}>
            <button disabled={busy}>{busy? 'Submitting...':'Submit Request'}</button>
            <button type="button" className="secondary" onClick={()=>{setForm({name:'',phone:'',city:'',description:'',serviceCode:services[0]?.code || 1}); setResult(null);}}>Reset</button>
          </div>
        </form>

        {result && (
          <div style={{marginTop:16, padding:18, borderRadius:12, background: result.status === 'success' ? 'rgba(20, 116, 204, 0.14)' : 'rgba(244, 63, 94, 0.14)', border: result.status === 'success' ? '1px solid rgba(28, 126, 255, 0.24)' : '1px solid rgba(244, 63, 94, 0.24)'}}>
            <div style={{marginBottom:8, display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:12,height:12,borderRadius:'50%', background: result.status === 'success' ? '#0ea5e9' : '#f43f5e'}} />
              <div style={{fontWeight:700, color: result.status === 'success' ? '#ecfeff' : '#fee2e2'}}>{result.message}</div>
            </div>
            {result.detail && <p className="muted">{result.detail}</p>}
            {result.lead && (
              <div style={{marginTop:10}}>
                <div style={{fontWeight:600, marginBottom:6}}>Assigned Providers</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {result.lead.assignedProviders.map(provider => (
                    <span key={provider._id} style={{background:'rgba(255,255,255,0.06)',padding:'6px 10px',borderRadius:8}}>{provider.name}</span>
                  ))}
                </div>
                <div style={{marginTop:12}}>
                  <a href={`/lead-status?phone=${encodeURIComponent(result.lead.phone)}`} style={{color:'#38bdf8',textDecoration:'underline'}}>Track this lead status</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
