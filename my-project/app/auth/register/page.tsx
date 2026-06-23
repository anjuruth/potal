'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Briefcase, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Looking for placement opportunities' },
  { value: 'faculty_advisor', label: 'Faculty Advisor', desc: 'Advise and mentor students' },
  { value: 'placement_officer', label: 'Placement Officer', desc: 'Manage placement drives' },
  { value: 'higher_authority', label: 'Higher Authority', desc: 'Oversee college placement activities' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleGoogle = () => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/auth/google`; };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="card p-10 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Check your email!</h2>
        <p className="text-slate-500 mb-6">We've sent a verification link. Please verify to activate your account.</p>
        <Link href="/auth/login" className="btn-primary w-full text-center block">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">PlaceCell</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join the placement portal today</p>
        </div>

        <div className="card p-8 shadow-lg">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-600" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-white dark:bg-slate-800 text-slate-400">or register with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input {...register('full_name', { required: 'Name is required' })} className="input" placeholder="John Doe" />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message as string}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Email Address</label>
                <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" className="input" placeholder="you@college.edu" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <input {...register('mobile', { required: 'Mobile required' })} type="tel" className="input" placeholder="98765 43210" />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message as string}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 chars" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><EyeOff className="w-4 h-4" /></button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
              </div>
              <div>
                <label className="label">College Name</label>
                <input {...register('college_name', { required: 'College name is required' })} className="input" placeholder="e.g. St. Xavier's College" />
                {errors.college_name && <p className="text-red-500 text-xs mt-1">{errors.college_name.message as string}</p>}
              </div>
              <div>
                <label className="label">Department</label>
                <input {...register('department_name')} className="input" placeholder="e.g. Computer Science" />
              </div>
            </div>

            <div>
              <label className="label">I am a...</label>
              <div className="space-y-2">
                {ROLES.map(role => (
                  <label key={role.value} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                    <input {...register('role', { required: 'Role is required' })} type="radio" value={role.value} className="mt-0.5 accent-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{role.label}</div>
                      <div className="text-xs text-slate-500">{role.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message as string}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
