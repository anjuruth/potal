'use client';
import { useEffect, useState } from 'react';
import { Briefcase, Loader2, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { studentApi } from '@/lib/api';

const STAGES = ['applied', 'aptitude_cleared', 'technical_cleared', 'hr_cleared', 'selected'];
const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied', aptitude_cleared: 'Aptitude', technical_cleared: 'Technical', hr_cleared: 'HR Round', selected: 'Selected',
};
const STATUS_UI: Record<string, string> = {
  applied: 'badge-info', aptitude_cleared: 'badge-warning', technical_cleared: 'badge-warning',
  hr_cleared: 'badge-warning', selected: 'badge-success', rejected: 'badge-danger',
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getApplications().then(r => setApps(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Track your placement application status</p>
      </div>

      {apps.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No applications yet</h3>
          <p className="text-sm text-slate-400">Apply to placement drives to track your progress here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => {
            const stageIdx = STAGES.indexOf(app.status);
            const isRejected = app.status === 'rejected';
            return (
              <div key={app.application_id} className="card p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{app.company_name}</h3>
                      <p className="text-sm text-slate-500">{app.job_role} · {app.package_lpa} LPA</p>
                    </div>
                  </div>
                  <span className={STATUS_UI[app.status] || 'badge-info'}>
                    {app.status === 'selected' ? '🎉 Selected!' : app.status === 'rejected' ? 'Not Selected' : STAGE_LABELS[app.status] || app.status}
                  </span>
                </div>

                {!isRejected && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {STAGES.map((stage, i) => {
                        const done = stageIdx >= i;
                        const current = stageIdx === i;
                        return (
                          <div key={stage} className="flex items-center flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                              ${done ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                              {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < STAGES.length - 1 && (
                              <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${stageIdx > i ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-700'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      {STAGES.map(s => (
                        <div key={s} className="flex-1 text-center">
                          <span className="text-xs text-slate-400">{STAGE_LABELS[s]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span>Applied: {new Date(app.application_date).toLocaleDateString()}</span>
                  {app.drive_date && <span>Drive: {new Date(app.drive_date).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
