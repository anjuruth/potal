'use client';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Save, Camera, User, BookOpen, Award } from 'lucide-react';
import { studentApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([studentApi.getProfile(), studentApi.getBatches?.()])
      .then(([profileRes, batchRes]) => {
        const p = profileRes.data;
        setProfile(p);
        setForm({
          full_name: p.full_name || '',
          mobile: p.mobile || '',
          register_no: p.register_no || '',
          cgpa: p.cgpa || '',
          backlog_count: p.backlog_count ?? 0,
          batch_id: p.batch_id || '',
        });
        if (batchRes) setBatches(batchRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) fd.append('photo', photoFile);
      await studentApi.updateProfile(fd);
      toast.success('Profile updated!');
      const res = await studentApi.getProfile();
      setProfile(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  );

  const completion = profile?.profile_completion || 0;
  const photoSrc = photoPreview || (profile?.photo ? (profile.photo.startsWith('http') ? profile.photo : `${API_BASE}${profile.photo}`) : null);

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal and academic information</p>
      </div>

      {/* Completion Banner */}
      <div className="card p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3" strokeDasharray={`${completion} ${100 - completion}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{completion}%</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Profile Completion</div>
          <div className="text-xs text-slate-500">{completion < 80 ? 'Complete your profile to apply for placement drives' : 'Great! Your profile is ready for placements'}</div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-2">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${completion}%`, background: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Profile Photo</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            {photoSrc ? (
              <img src={photoSrc} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-slate-200">
                <User className="w-8 h-8 text-blue-400" />
              </div>
            )}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm py-2 px-4">
              {photoSrc ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Mobile Number</label>
            <input className="input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile number" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={profile?.email || ''} disabled />
          </div>
          <div>
            <label className="label">College</label>
            <input className="input bg-slate-50" value={profile?.college_name || 'Not set'} disabled />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input bg-slate-50" value={profile?.department_name || 'Not set'} disabled />
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Academic Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Register Number</label>
            <input className="input" value={form.register_no} onChange={e => setForm({ ...form, register_no: e.target.value })} placeholder="e.g. 20CS001" />
          </div>
          <div>
            <label className="label">CGPA</label>
            <input className="input" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="e.g. 8.5" />
          </div>
          <div>
            <label className="label">Active Backlogs</label>
            <input className="input" type="number" min="0" value={form.backlog_count} onChange={e => setForm({ ...form, backlog_count: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Batch</label>
            {batches.length > 0 ? (
              <select className="input" value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
              </select>
            ) : (
              <input className="input bg-slate-50" value={profile?.batch_name || 'No batches available'} disabled />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
