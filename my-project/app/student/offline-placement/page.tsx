'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Plus, Loader2, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { studentApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function OfflinePlacementPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [form, setForm] = useState({ company_name: '', job_role: '', package_lpa: '', placement_date: '', location: '' });

  const load = () =>
    studentApi.getAchievements()
      .then(r => setAchievements(r.data.filter((a: any) => a.achievement_type === 'offline_placement')))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name) return toast.error('Company name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (offerFile) fd.append('offer_letter', offerFile);
      await studentApi.submitOfflinePlacement(fd);
      toast.success('Offline placement submitted!');
      setForm({ company_name: '', job_role: '', package_lpa: '', placement_date: '', location: '' });
      setOfferFile(null);
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Offline Placement</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Submit placements secured outside the portal for verification</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Submit Placement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-4">Submit Offline Placement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Company Name *</label>
                  <input required className="input" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Infosys" />
                </div>
                <div>
                  <label className="label">Job Role</label>
                  <input className="input" value={form.job_role} onChange={e => setForm({ ...form, job_role: e.target.value })} placeholder="e.g. Software Engineer" />
                </div>
                <div>
                  <label className="label">Package (LPA)</label>
                  <input className="input" type="number" step="0.1" value={form.package_lpa} onChange={e => setForm({ ...form, package_lpa: e.target.value })} placeholder="e.g. 6.5" />
                </div>
                <div>
                  <label className="label">Placement Date</label>
                  <input className="input" type="date" value={form.placement_date} onChange={e => setForm({ ...form, placement_date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
                </div>
                <div className="col-span-2">
                  <label className="label">Offer Letter (PDF)</label>
                  <label className="flex items-center gap-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-500">{offerFile ? offerFile.name : 'Upload offer letter'}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setOfferFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setOfferFile(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {achievements.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No offline placements submitted</h3>
          <p className="text-sm text-slate-400 mb-4">Got placed through campus or referral? Submit your offer letter for verification</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Submit Placement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map(a => {
            let details: any = {};
            try { details = JSON.parse(a.achievement_details || '{}'); } catch {}
            return (
              <div key={a.achievement_id} className="card p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{a.achievement_title}</h3>
                      <p className="text-sm text-slate-500">{details.job_role || 'Role not specified'}</p>
                    </div>
                  </div>
                  <span className="badge-warning flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending Verification
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {details.package_lpa && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Package</div>
                      <div className="text-sm font-semibold text-emerald-600">{details.package_lpa} LPA</div>
                    </div>
                  )}
                  {details.location && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Location</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{details.location}</div>
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <div className="text-xs text-slate-400">Submitted</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(a.achievement_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {details.offer_letter && (
                  <a href={`${API_BASE}${details.offer_letter}`} target="_blank" rel="noopener noreferrer"
                    className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> View Offer Letter
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
