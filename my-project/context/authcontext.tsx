'use client';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  mobile?: string;
  role: string;
  status: string;
  college_id?: number;
  department_id?: number;
  photo?: string;
  email_verified?: boolean;
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr); } catch { return null; }
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch { return false; }
};

export const getDashboardPath = (role: string): string => {
  const paths: Record<string, string> = {
    student: '/student/dashboard',
    faculty_advisor: '/faculty/dashboard',
    placement_officer: '/placement/dashboard',
    higher_authority: '/authority/dashboard',
    super_admin: '/admin/dashboard',
  };
  return paths[role] || '/';
};

export const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  faculty_advisor: 'Faculty Advisor',
  placement_officer: 'Placement Officer',
  higher_authority: 'Higher College Authority',
  super_admin: 'Super Admin',
};