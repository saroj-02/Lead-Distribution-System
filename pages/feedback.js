import { useState } from 'react';

export default function Feedback(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  async function submit(e){
    e.preventDefault();
    setStatus('loading');
    try{
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({name,email,message})
      });
      if(res.ok){
        setStatus('success');
        setName('');setEmail('');setMessage('');
      }else{
        setStatus('error');
      }
    }catch(e){
      setStatus('error');
    }
  }

  return (
    <div className="card" style={{maxWidth:720,margin:'0 auto'}}>
      <h2>Feedback</h2>
      <p className="muted">We appreciate your feedback — tell us what to improve.</p>

      <form onSubmit={submit} style={{marginTop:12}}>
        <div className="form-row">
          <div className="col">
            <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="col">
            <input placeholder="Email " value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{marginTop:12}}>
          <textarea placeholder="Your feedback" value={message} onChange={e=>setMessage(e.target.value)} />
        </div>

        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button type="submit">Send Feedback</button>
          <button type="button" className="secondary" onClick={()=>{setName('');setEmail('');setMessage('');setStatus(null)}}>Clear</button>
        </div>

        {status === 'loading' && <div style={{marginTop:12}}>Sending…</div>}
        {status === 'success' && <div style={{marginTop:12,color:'#8ef78e'}}>Thanks — feedback received.</div>}
        {status === 'error' && <div style={{marginTop:12,color:'#ff8b8b'}}>Unable to send — try again later.</div>}
      </form>
    </div>
  )
}
