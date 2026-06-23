import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (!pathname.startsWith('/auth')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
  selectRole: (data: object) => api.post('/auth/select-role', data),
};

// Student
export const studentApi = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data: FormData) => api.put('/student/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getSkills: () => api.get('/student/skills'),
  getAvailableSkills: () => api.get('/student/skills/available'),
  addSkill: (data: FormData) => api.post('/student/skills', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateSkill: (id: number, data: FormData) => api.put(`/student/skills/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteSkill: (id: number) => api.delete(`/student/skills/${id}`),

  getDrives: () => api.get('/student/drives'),
  applyDrive: (driveId: number) => api.post(`/student/drives/${driveId}/apply`),
  getApplications: () => api.get('/student/applications'),

  getExams: () => api.get('/student/exams'),
  getExamQuestions: (examId: number) => api.get(`/student/exams/${examId}/questions`),
  submitExam: (examId: number, data: object) => api.post(`/student/exams/${examId}/submit`, data),

  getResults: () => api.get('/student/results'),

  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id: number) => api.put(`/student/notifications/${id}/read`),

  submitOfflinePlacement: (data: FormData) => api.post('/student/offline-placement', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getAchievements: () => api.get('/student/achievements'),
  addAchievement: (data: FormData) => api.post('/student/achievements', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// General
export const generalApi = {
  getColleges: () => api.get('/colleges'),
  getDepartments: (collegeId: string) => api.get(`/colleges/${collegeId}/departments`),
  getSkillCategories: () => api.get('/skill-categories'),
  getSkillLevels: () => api.get('/skill-levels'),
};