'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, Users, Award, TrendingUp, BookOpen, Bell,
  CheckCircle, ArrowRight, Menu, X, Mail, Phone, MapPin,
  Star, ChevronRight, Building2, GraduationCap, BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Placement Drives',
    description: 'Browse active drives, check eligibility, and apply with one click. Track your application status in real time.',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Online Examinations',
    description: 'Attempt aptitude, technical, and coding tests directly in the portal. Auto-graded with instant rankings.',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  },
  {
    icon: Award,
    title: 'Skill Portfolio',
    description: 'Showcase your skills and certifications. Get verified by faculty advisors to boost credibility.',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Administrators get placement statistics, batch performance reports, and real-time insights.',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss a deadline. Get notified for new drives, exam schedules, and results via email and portal.',
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Tailored dashboards for students, advisors, placement officers, and administrators.',
    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
  },
];

const stats = [
  { label: 'Students Placed', value: '2,400+', icon: GraduationCap, color: 'text-blue-600' },
  { label: 'Partner Companies', value: '180+', icon: Building2, color: 'text-emerald-600' },
  { label: 'Avg. Package', value: '₹8.2 LPA', icon: TrendingUp, color: 'text-purple-600' },
  { label: 'Placement Rate', value: '94%', icon: Star, color: 'text-amber-600' },
];

const steps = [
  { num: '01', title: 'Register & Verify', desc: 'Sign up with your college email. Verify in one click.' },
  { num: '02', title: 'Complete Profile', desc: 'Add your academics, skills, and upload your resume.' },
  { num: '03', title: 'Explore Drives', desc: 'Browse companies matching your profile and eligibility.' },
  { num: '04', title: 'Get Placed', desc: 'Track your journey from application to final selection.' },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-100 dark:border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">PlaceCell</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#stats" className="hover:text-blue-600 transition-colors">Stats</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2">Get Started</Link>
            </div>

            <button className="md:hidden p-2 rounded-lg text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pb-4">
            <div className="flex flex-col gap-2 pt-3">
              {['features', 'how-it-works', 'stats', 'contact'].map(s => (
                <a key={s} href={`#${s}`} className="py-2.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 capitalize" onClick={() => setMobileOpen(false)}>
                  {s.replace('-', ' ')}
                </a>
              ))}
              <div className="flex gap-2 mt-2">
                <Link href="/auth/login" className="btn-secondary flex-1 text-center text-sm">Sign In</Link>
                <Link href="/auth/register" className="btn-primary flex-1 text-center text-sm">Register</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Now live — 2025 placement season open
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            Your career starts{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              right here.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
            The complete placement cell management portal — connecting students with opportunities,
            advisors with insights, and institutions with results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-base py-3.5 px-8 rounded-xl flex items-center gap-2 group justify-center">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base py-3.5 px-8 rounded-xl justify-center">
              Sign In to Portal
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-3xl font-bold font-display ${s.color} mb-1`}>{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">About the Portal</div>
              <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-5">
                Built for modern placement cells
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                PlaceCell is a comprehensive placement management system that brings students, faculty advisors,
                placement officers, and college authorities onto a single unified platform.
              </p>
              <ul className="space-y-3">
                {[
                  'End-to-end placement workflow management',
                  'Automated eligibility checks and notifications',
                  'Online exam engine with question banks',
                  'Real-time analytics for administrators',
                  'Excel import/export for bulk operations',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, title: 'For Students', desc: 'Apply to drives, take exams, track progress', color: 'bg-blue-500' },
                { icon: Users, title: 'For Advisors', desc: 'Manage batches, verify skills, guide students', color: 'bg-purple-500' },
                { icon: Building2, title: 'For Officers', desc: 'Post drives, coordinate with companies', color: 'bg-amber-500' },
                { icon: BarChart3, title: 'For Authority', desc: 'View reports, monitor placement rates', color: 'bg-emerald-500' },
              ].map(card => (
                <div key={card.title} className="card p-5 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{card.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</div>
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              One platform for the entire placement lifecycle — from student registration to final offer letter.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-lg transition-all duration-200 group">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Process</div>
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">From signup to placement</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="card p-6">
                  <div className="font-display text-4xl font-black text-blue-100 dark:text-blue-900 mb-4">{step.num}</div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Trusted by institutions</h2>
          <p className="text-blue-100 text-lg mb-12">Results that speak for themselves</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-5xl font-display font-black text-white mb-2">{s.value}</div>
                <div className="text-blue-200 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Contact</div>
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">Get in touch</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Mail, label: 'Email', value: 'support@placecell.edu' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: MapPin, label: 'Location', value: 'Kerala, India' },
                ].map(c => (
                  <div key={c.label} className="text-center">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <c.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{c.label}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">PlaceCell</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Placement Cell Management Portal. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}