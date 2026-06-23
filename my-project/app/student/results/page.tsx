'use client';
import { useEffect, useState } from 'react';
import { Trophy, Loader2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getResults().then(r => setResults(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const passed = results.filter(r => r.result_status === 'pass').length;
  const avgPct = results.length ? results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Exam Results</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Your performance across all examinations</p>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Exams', value: results.length, icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Passed', value: passed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Failed', value: results.length - passed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Avg Score', value: `${avgPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold font-display text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No results yet</h3>
          <p className="text-sm text-slate-400">Complete exams to see your results here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(r => {
            const pct = parseFloat(r.percentage);
            const pass = r.result_status === 'pass';
            return (
              <div key={r.result_id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{r.exam_name}</h3>
                    <p className="text-sm text-slate-400">{r.exam_type}</p>
                  </div>
                  <span className={pass ? 'badge-success' : 'badge-danger'}>
                    {pass ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Score', value: `${r.obtained_marks} / ${r.total_marks}` },
                    { label: 'Percentage', value: `${pct.toFixed(1)}%` },
                    { label: 'Grade', value: r.grade },
                    { label: 'Rank', value: r.rank ? `#${r.rank}` : 'N/A' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
