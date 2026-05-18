import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthPage(){
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to home
  useEffect(()=>{
    if(session){
      router.replace('/');
    }
  },[session, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      localStorage.setItem('pw_auth_role', role);
      
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        name: isLogin ? '' : name,
      });

      if (res?.error) {
        setError('Authentication failed. Please check your details.');
        setLoading(false);
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }



  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #071026 0%, #0a1b35 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: 440,
        width: '100%',
        padding: '36px 32px',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{textAlign: 'center', marginBottom: 28}}>
          <div style={{fontSize: 32, fontWeight: 800, color: '#06b6d4', marginBottom: 8, letterSpacing: '-0.5px'}}>Prowider</div>
          <div style={{color: '#94a3b8', fontSize: 15}}>Professional lead distribution</div>
        </div>

        <div style={{display: 'flex', marginBottom: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4}}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: isLogin ? '#06b6d4' : 'transparent',
              color: isLogin ? '#04202a' : '#94a3b8'
            }}>
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: !isLogin ? '#06b6d4' : 'transparent',
              color: !isLogin ? '#04202a' : '#94a3b8'
            }}>
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {!isLogin && (
            <div>
              <label style={{display: 'block', marginBottom: 6, fontSize: 14, color: '#cbd5e1', fontWeight: 500}}>Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                style={{width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none'}}
              />
            </div>
          )}

          <div>
            <label style={{display: 'block', marginBottom: 6, fontSize: 14, color: '#cbd5e1', fontWeight: 500}}>Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none'}}
            />
          </div>

          <div>
            <label style={{display: 'block', marginBottom: 6, fontSize: 14, color: '#cbd5e1', fontWeight: 500}}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none'}}
            />
          </div>

          <div>
            <label style={{display: 'block', marginBottom: 6, fontSize: 14, color: '#cbd5e1', fontWeight: 500}}>I am a...</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', appearance: 'none'}}
            >
              <option value="customer">Customer (Looking for services)</option>
              <option value="provider">Provider (Fulfilling services)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'linear-gradient(90deg, #0ea5e9, #2dd4bf)',
              color: '#04202a',
              border: 'none',
              padding: '14px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>



      </div>
    </div>
  )
}
