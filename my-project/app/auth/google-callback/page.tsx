'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setAuth, getDashboardPath } from '@/lib/auth';

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get('token');
    const userData = params.get('user');
    if (!token || !userData) { router.push('/auth/login?error=google'); return; }
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      setAuth(token, user);
      if (!user.role) router.push('/auth/select-role');
      else router.push(getDashboardPath(user.role));
    } catch { router.push('/auth/login?error=google'); }
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}><CallbackContent /></Suspense>;
}
