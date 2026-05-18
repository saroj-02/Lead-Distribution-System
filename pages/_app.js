import '../styles.css';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

function Header(){
  const { data: session, status } = useSession();
  const [role, setRole] = useState('customer');

  useEffect(() => {
    try{
      const savedRole = localStorage.getItem('pw_auth_role');
      if(savedRole) setRole(savedRole);
    }catch(e){}
  },[session]);

  return (
    <header className="container header">
      <div className="header-left">
        <div className="logo">Prowider</div>
        {session && <div className="role-badge">{role === 'provider' ? 'Provider' : 'Customer'}</div>}
      </div>

      {session && (
        <nav className="nav">
          {role === 'customer' ? (
            <>
              <a href="/request-service">Request Service</a>
              <a href="/lead-status">Track Lead</a>
              <a href="/feedback">Feedback</a>
            </>
          ) : (
            <>
              <a href="/dashboard">Dashboard</a>
              <a href="/test-tools">Test Tools</a>
            </>
          )}
        </nav>
      )}

      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
        {session ? (
          <>
            <div style={{fontSize:12,color:'#cbd5e1'}}>Hi, {session.user?.name || session.user?.email}</div>
            <button className="role-btn" onClick={async () => {
              try{ localStorage.removeItem('pw_auth_role'); }catch(e){}
              await signOut({ redirect: false });
              window.location.href = '/auth';
            }}>Logout</button>
          </>
        ) : null}
      </div>
    </header>
  )
}

function Footer(){
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-title">Designed and developed by Saroj Padhi</div>
          <div className="footer-subtitle">Professional lead distribution for providers and customers.</div>
        </div>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/saroj-padhi-492979270" target="_blank">LinkedIn</a>
          <a href="https://www.github.com/saroj-02" target="_blank">GitHub</a>
          <a href="https://portfolio-8-4qo4.onrender.com/" target="_blank">Portfolio</a>
        </div>
      </div>
    </footer>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }){
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(status === 'loading') return;
    setIsLoading(false);

    // If not authenticated and not on auth page, redirect to auth
    if(!session && router.pathname !== '/auth' && router.pathname !== '/_error'){
      router.replace('/auth');
      return;
    }

    // If authenticated, ensure role is set
    if(session){
      try{
        const authRole = localStorage.getItem('pw_auth_role');
        if(!authRole){
          localStorage.setItem('pw_auth_role', 'customer');
        }
      }catch(e){}
    }
  }, [session, status, router]);

  if(isLoading || status === 'loading') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="container" style={{ flex: 1, width: '100%', paddingTop: session ? 8 : 0 }}>
        <Component {...pageProps} />
      </main>
      {session && <Footer />}
    </div>
  );
}
