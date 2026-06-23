'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { studentApi } from '@/lib/api';

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    studentApi.getExamQuestions(Number(examId))
      .then(r => {
        setExam(r.data.exam);
        setQuestions(r.data.questions);
        setTimeLeft(r.data.exam.duration * 60);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load exam');
        router.push('/student/exams');
      })
      .finally(() => setLoading(false));
  }, [examId]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || submitted) return;
    if (!auto && !confirm('Submit exam? You cannot change answers after submission.')) return;
    setSubmitting(true);
    try {
      const res = await studentApi.submitExam(Number(examId), { answers });
      setResult(res.data);
      setSubmitted(true);
      toast.success('Exam submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  }, [examId, answers, submitting, submitted]);

  useEffect(() => {
    if (!exam || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, submitted, handleSubmit]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (submitted && result) return (
    <div className="animate-fade-in max-w-lg mx-auto text-center py-12">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.result_status === 'pass' ? 'bg-emerald-100' : 'bg-red-100'}`}>
        {result.result_status === 'pass' ? <CheckCircle className="w-10 h-10 text-emerald-600" /> : <AlertCircle className="w-10 h-10 text-red-500" />}
      </div>
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {result.result_status === 'pass' ? 'Congratulations!' : 'Better Luck Next Time'}
      </h1>
      <p className="text-slate-500 mb-8">Your exam has been submitted and evaluated.</p>
      <div className="card p-6 mb-6 text-left">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Score', value: `${result.score} / ${exam.total_marks}` },
            { label: 'Percentage', value: `${result.percentage}%` },
            { label: 'Grade', value: result.grade },
            { label: 'Status', value: result.result_status.toUpperCase() },
            { label: 'Correct', value: result.correct },
            { label: 'Wrong', value: result.wrong },
            { label: 'Unanswered', value: result.unanswered },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
              <div className="font-bold text-slate-900 dark:text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => router.push('/student/results')} className="btn-primary">View All Results</button>
    </div>
  );

  const q = questions[current];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const answered = Object.keys(answers).length;
  const urgent = timeLeft < 300;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-slate-900 dark:text-white">{exam?.exam_name}</h1>
          <p className="text-xs text-slate-500">{answered}/{questions.length} answered</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${urgent ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20'}`}>
          <Clock className="w-5 h-5" />
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-info">Q {current + 1} of {questions.length}</span>
          <span className="text-xs text-slate-400">{q?.marks} mark{q?.marks > 1 ? 's' : ''}</span>
          <span className="text-xs text-slate-400 capitalize">{q?.difficulty}</span>
        </div>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed mb-6 font-medium">{q?.question_text}</p>
        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map(opt => {
            const text = q?.[`option_${opt.toLowerCase()}`];
            if (!text) return null;
            const selected = answers[q.question_id] === opt;
            return (
              <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.question_id]: opt }))}
                className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${selected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{opt}</span>
                <span className="text-sm">{text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-1 flex-wrap justify-center max-w-xs">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${i === current ? 'bg-blue-600 text-white' : answers[questions[i]?.question_id] ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="btn-secondary flex items-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => handleSubmit()} disabled={submitting}
            className="btn-primary flex items-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
