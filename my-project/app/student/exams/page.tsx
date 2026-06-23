'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, Clock, CheckCircle, Lock, Calendar } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getExams().then(r => setExams(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.start_time) > now);
  const active = exams.filter(e => new Date(e.start_time) <= now && new Date(e.end_time) >= now && !e.attempted);
  const completed = exams.filter(e => e.attempted || new Date(e.end_time) < now);

  const ExamCard = ({ exam }: { exam: any }) => {
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    const isActive = start <= now && end >= now && !exam.attempted;
    const isPast = end < now;
    return (
      <div className="card p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
              <BookOpen className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{exam.exam_name}</h3>
              <p className="text-xs text-slate-400">{exam.exam_type}</p>
            </div>
          </div>
          {exam.attempted ? (
            <span className="badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>
          ) : isPast ? (
            <span className="badge-danger">Missed</span>
          ) : isActive ? (
            <span className="badge-info animate-pulse">Live</span>
          ) : (
            <span className="badge-warning">Upcoming</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-400">Duration</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{exam.duration}m</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-400">Total Marks</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{exam.total_marks}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-400">Passing</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{exam.passing_marks}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{start.toLocaleString()} – {end.toLocaleString()}</span>
        </div>

        {isActive ? (
          <Link href={`/student/exams/${exam.exam_id}`} className="btn-primary w-full text-center block text-sm py-2">
            Start Exam
          </Link>
        ) : exam.attempted ? (
          <Link href="/student/results" className="btn-secondary w-full text-center block text-sm py-2">
            View Result
          </Link>
        ) : (
          <button disabled className="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            {isPast ? 'Exam Ended' : `Opens ${start.toLocaleDateString()}`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Examinations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">View and attempt your assigned exams</p>
      </div>

      {exams.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No exams assigned</h3>
          <p className="text-sm text-slate-400">Exams assigned to your batch will appear here</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Active Now ({active.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(e => <ExamCard key={e.exam_id} exam={e} />)}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Upcoming ({upcoming.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map(e => <ExamCard key={e.exam_id} exam={e} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Completed ({completed.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(e => <ExamCard key={e.exam_id} exam={e} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
