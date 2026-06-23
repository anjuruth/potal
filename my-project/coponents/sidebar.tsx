'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, User as UserIcon, Code2, Briefcase, BookOpen,
  FileText, Bell, LogOut, Menu, X, Sun, Moon,
  Trophy, Upload, ChevronDown, Briefcase as BriefcaseIcon,
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import type { User } from '@/lib/auth';

const navItems = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/profile', icon: UserIcon, label: 'My Profile' },
  { href: '/student/skills', icon: Code2, label: 'Skills & Certs' },
  { href: '/student/drives', icon: Briefcase, label: 'Placement Drives' },
  { href: '/student/applications', icon: FileText, label: 'My Applications' },
  { href: '/student/exams', icon: BookOpen, label: 'Exams' },
  { href: '/student/results', icon: Trophy, label: 'Results' },
  { href: '/student/offline-placement', icon: Upload, label: 'Offline Placement' },
  { href: '/student/notifications', icon: Bell, label: 'Notifications' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(u);
    const dark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(dark);
    if (dark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-700">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <BriefcaseIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-white">PlaceCell</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {user?.photo ? (
            <img src={user.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                {user?.full_name?.charAt(0) || 'S'}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</div>
            <div className="text-xs text-slate-500 truncate">Student</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-700 space-y-0.5">
        <button onClick={toggleDark} className="sidebar-link w-full">
          {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-slate-800 h-full shadow-xl flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 h-14 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {navItems.find(n => n.href === pathname)?.label || 'Student Portal'}
            </h2>
          </div>
          <Link href="/student/notifications" className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}