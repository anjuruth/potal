'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, BookOpen, Bell, UserIcon, CheckCircle, ArrowRight, AlertCircle, Loader2, Trophy, Clock } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

const STATUS_COLORS: Record<string, string> = {
  applied: 'badge-info', aptitude_cleared: 'badge-warning', technical_cleared: 'badge-warning',
  hr_cleared: 'badge-warning', selected: 'badge-success', rejected: 'badge-danger',
};
const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', aptitude_cleared: 'Aptitude Cleared', technical_cleared: 'Technical Cleared',
  hr_cleared: 'HR Cleared', selected: 'Selected 🎉', rejected: 'Not Selected',
};

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    studentApi.getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  const completion = data?.stats?.profile_completion || 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Good morning, {user?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Here's what's happening with your placements today.</p>
      </div>

      {completion < 80 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Your profile is {completion}% complete</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Complete your profile to apply for placement drives</div>
          </div>
          <Link href="/student/profile" className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 flex items-center gap-1">
            Complete now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Applied Drives', value: data?.stats?.applied_drives || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/student/applications' },
          { label: 'Upcoming Exams', value: data?.stats?.upcoming_exams || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/student/exams' },
          { label: 'Unread Alerts', value: data?.stats?.unread_notifications || 0, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/student/notifications' },
          { label: 'Profile', value: `${completion}%`, icon: UserIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', href: '/student/profile' },
        ].map(card => (
          <Link key={card.label} href={card.href} className="stat-card group">
            <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">{card.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="section-heading text-base mb-4">Profile Completion</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3" strokeDasharray={`${completion} ${100 - completion}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{completion}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: 'Basic Info', done: !!(user?.full_name && user?.mobile) },
                { label: 'Academic Details', done: completion >= 40 },
                { label: 'Profile Photo', done: !!(user?.photo) },
                { label: 'Skills Added', done: completion >= 80 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`w-3.5 h-3.5 ${item.done ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={item.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/student/profile" className="mt-4 block text-center text-xs font-medium text-blue-600 hover:text-blue-700">Update Profile →</Link>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-heading text-base">Recent Applications</h3>
            <Link href="/student/applications" className="text-xs text-blue-600 font-medium">View all →</Link>
          </div>
          {data?.recent_applications?.length ? (
            <div className="space-y-3">
              {data.recent_applications.map((app: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{app.company_name}</div>
                      <div className="text-xs text-slate-400">{app.job_role}</div>
                    </div>
                  </div>
                  <span className={STATUS_COLORS[app.status] || 'badge-info'}>{STATUS_LABELS[app.status] || app.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No applications yet</p>
              <Link href="/student/drives" className="text-xs text-blue-600 mt-1 block">Browse drives →</Link>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-heading text-base mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/student/profile', icon: UserIcon, label: 'Complete Profile', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { href: '/student/drives', icon: Briefcase, label: 'View Drives', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            { href: '/student/skills', icon: Trophy, label: 'Add Skills', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
            { href: '/student/exams', icon: BookOpen, label: 'View Exams', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
          ].map(a => (
            <Link key={a.href} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors cursor-pointer ${a.color}`}>
              <a.icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {data?.recent_results?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-heading text-base">Recent Results</h3>
            <Link href="/student/results" className="text-xs text-blue-600 font-medium">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.recent_results.map((r: any, i: number) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">{r.exam_name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">{r.grade}</span>
                  <span className="text-sm text-slate-500">{r.percentage}%</span>
                </div>
                <span className={`mt-2 inline-block text-xs ${r.result_status === 'pass' ? 'badge-success' : 'badge-danger'}`}>
                  {r.result_status === 'pass' ? 'Passed' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
