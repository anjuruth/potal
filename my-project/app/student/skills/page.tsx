'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Code2, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { studentApi } from '@/lib/api';

const STATUS_UI: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'Pending Review', cls: 'badge-warning', icon: Clock },
  verified: { label: 'Verified', cls: 'badge-success', icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'badge-danger', icon: XCircle },
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [form, setForm] = useState({ skill_id: '' });

  const load = async () => {
    try {
      const [s, a] = await Promise.all([studentApi.getSkills(), studentApi.getAvailableSkills()]);
      setSkills(s.data);
      setAvailable(a.data);
      const cats: string[] = [];
      a.data.forEach((x: any) => { if (!cats.includes(x.category_name)) cats.push(x.category_name); });
      setCategories(cats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.skill_id) return toast.error('Please select a skill');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('skill_id', form.skill_id);
      if (certFile) fd.append('certificate_file', certFile);
      await studentApi.addSkill(fd);
      toast.success('Skill added!');
      setForm({ skill_id: '' });
      setCertFile(null);
      setShowAdd(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to add skill'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this skill?')) return;
    try {
      await studentApi.deleteSkill(id);
      toast.success('Skill removed');
      setSkills(prev => prev.filter(s => s.student_skill_id !== id));
    } catch { toast.error('Failed to remove skill'); }
  };

  const grouped = categories.map(cat => ({
    cat,
    skills: skills.filter(s => s.category_name === cat),
  })).filter(g => g.skills.length > 0);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Skills & Certifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Showcase your technical and soft skills</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Add Skill Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-4">Add Skill</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Select Skill</label>
                <select className="input" value={form.skill_id} onChange={e => setForm({ skill_id: e.target.value })}>
                  <option value="">Choose a skill...</option>
                  {categories.map(cat => (
                    <optgroup key={cat} label={cat}>
                      {available.filter(s => s.category_name === cat).map(s => (
                        <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Certificate (optional)</label>
                <label className="flex items-center gap-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">{certFile ? certFile.name : 'Upload certificate PDF/image'}</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setCertFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAdd(false); setForm({ skill_id: '' }); setCertFile(null); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="card p-12 text-center">
          <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No skills added yet</h3>
          <p className="text-sm text-slate-400 mb-4">Add your technical skills and certifications to boost your profile</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cat, skills: catSkills }) => (
            <div key={cat} className="card p-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" /> {cat}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {catSkills.map(skill => {
                  const ui = STATUS_UI[skill.status] || STATUS_UI.pending;
                  return (
                    <div key={skill.student_skill_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                          <Code2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{skill.skill_name}</div>
                          <span className={`text-xs ${ui.cls}`}>{ui.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {skill.certificate_file && (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${skill.certificate_file}`}
                            target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Cert</a>
                        )}
                        <button onClick={() => handleDelete(skill.student_skill_id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
