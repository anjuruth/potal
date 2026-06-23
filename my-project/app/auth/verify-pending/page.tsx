'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Briefcase, Loader2, RefreshCw } from 'lucide-react';
import { authApi } from '@/lib/api';

function VerifyContent() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    if (!email) return toast.error('Email not found');
    setLoading(true);
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">PlaceCell</span>
        </Link>
        <div className="card p-8 shadow-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
          <p className="text-slate-500 mb-2">We sent a verification link to:</p>
          <p className="font-semibold text-slate-800 mb-6 break-all">{email || 'your email'}</p>
          <p className="text-sm text-slate-400 mb-6">Click the link to activate your account. Check your spam folder if needed.</p>
          <button onClick={resend} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><RefreshCw className="w-4 h-4" /> Resend verification email</>}
          </button>
          <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPendingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}><VerifyContent /></Suspense>;
}
