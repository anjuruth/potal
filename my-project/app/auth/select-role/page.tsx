'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Briefcase, GraduationCap, Users, Building2, BarChart3, Loader2 } from 'lucide-react';
import { authApi, generalApi } from '@/lib/api';
import { getUser, setAuth, getDashboardPath } from '@/lib/auth';

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Apply to placement drives, take exams', icon: GraduationCap, color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'faculty_advisor', label: 'Faculty Advisor', desc: 'Manage and guide student batches', icon: Users, color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { value: 'placement_officer', label: 'Placement Officer', desc: 'Post drives and coordinate companies', icon: Briefcase, color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { value: 'higher_authority', label: 'Higher Authority', desc: 'Monitor placement statistics', icon: BarChart3, color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [collegeId, setCollegeId] = useState('');
  const [deptId, setDeptId] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user?.role) { router.push(getDashboardPath(user.role)); return; }
    generalApi.getColleges().then(r => setColleges(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (collegeId) generalApi.getDepartments(collegeId).then(r => setDepartments(r.data)).catch(() => {});
  }, [collegeId]);

  const handleSubmit = async () => {
    if (!selected) return toast.error('Please select a role');
    setLoading(true);
    try {
      const res = await authApi.selectRole({ role: selected, college_id: collegeId || undefined, department_id: deptId || undefined });
      setAuth(res.data.token, res.data.user);
      toast.success('Role set successfully!');
      router.push(getDashboardPath(res.data.user.role));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to set role');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Choose your role</h1>
          <p className="text-slate-500 mt-2">Select your role in the placement portal</p>
        </div>

        <div className="card p-6 shadow-lg">
          <div className="space-y-3 mb-6">
            {ROLES.map(role => (
              <button key={role.value} type="button" onClick={() => setSelected(role.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selected === role.value ? `${role.color} border-current` : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected === role.value ? '' : 'bg-slate-100'}`}>
                  <role.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{role.label}</div>
                  <div className="text-xs text-slate-500">{role.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-3 mb-6 border-t border-slate-100 pt-4">
              <div>
                <label className="label">College</label>
                <select className="input" value={collegeId} onChange={e => setCollegeId(e.target.value)}>
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c.college_id} value={c.college_id}>{c.college_name}</option>)}
                </select>
              </div>
              {collegeId && (
                <div>
                  <label className="label">Department</label>
                  <select className="input" value={deptId} onChange={e => setDeptId(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !selected} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting role...</> : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
