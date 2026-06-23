'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, Calendar, TrendingUp, CheckCircle, XCircle, Loader2, Search, Building2 } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function DrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const res = await studentApi.getDrives();
      setDrives(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const apply = async (driveId: number) => {
    setApplying(driveId);
    try {
      await studentApi.applyDrive(driveId);
      toast.success('Application submitted!');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setApplying(null); }
  };

  const filtered = drives.filter(d => {
    const matchSearch = d.company_name.toLowerCase().includes(search.toLowerCase()) ||
      d.job_role.toLowerCase().includes(search.toLowerCase());
    if (filter === 'eligible') return matchSearch && d.cgpa_eligible && d.backlog_eligible && d.dept_eligible && !d.already_applied;
    if (filter === 'applied') return matchSearch && d.already_applied;
    return matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Placement Drives</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Browse and apply for active placement opportunities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'eligible', 'applied'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No drives found</h3>
          <p className="text-sm text-slate-400">Check back later for new placement opportunities</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(drive => {
            const eligible = drive.cgpa_eligible && drive.backlog_eligible && drive.dept_eligible;
            const deadline = new Date(drive.application_deadline);
            const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
            return (
              <div key={drive.drive_id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">{drive.company_name}</h3>
                      <p className="text-slate-500 text-sm">{drive.job_role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {drive.already_applied ? (
                      <span className="badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Applied</span>
                    ) : (
                      <button onClick={() => apply(drive.drive_id)} disabled={!eligible || applying === drive.drive_id}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${eligible ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                        {applying === drive.drive_id ? <Loader2 className="w-4 h-4 animate-spin" /> : eligible ? 'Apply Now' : 'Not Eligible'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-0.5">Package</div>
                    <div className="text-sm font-semibold text-emerald-600">{drive.package_lpa} LPA</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-0.5">Min CGPA</div>
                    <div className={`text-sm font-semibold ${drive.cgpa_eligible ? 'text-slate-800 dark:text-slate-200' : 'text-red-500'}`}>{drive.minimum_cgpa}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-0.5">Max Backlogs</div>
                    <div className={`text-sm font-semibold ${drive.backlog_eligible ? 'text-slate-800 dark:text-slate-200' : 'text-red-500'}`}>{drive.max_backlogs ?? 'None'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-0.5">Deadline</div>
                    <div className={`text-sm font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                    </div>
                  </div>
                </div>

                {!eligible && !drive.already_applied && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!drive.cgpa_eligible && <span className="badge-danger flex items-center gap-1"><XCircle className="w-3 h-3" /> CGPA not met</span>}
                    {!drive.backlog_eligible && <span className="badge-danger flex items-center gap-1"><XCircle className="w-3 h-3" /> Backlogs exceed limit</span>}
                    {!drive.dept_eligible && <span className="badge-danger flex items-center gap-1"><XCircle className="w-3 h-3" /> Department not eligible</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
