import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      const role = localStorage.getItem('pw_auth_role') || 'customer';
      if (role === 'provider') {
        router.replace('/dashboard');
      } else {
        router.replace('/request-service');
      }
    }
  }, [session, status, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <p className="muted">Redirecting to your workspace...</p>
    </div>
  );
}
