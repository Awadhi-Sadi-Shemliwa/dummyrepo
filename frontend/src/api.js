import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('arc_token');
      localStorage.removeItem('arc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
};

export const usersAPI = {
  getAll: () => api.get('/api/users'),
  create: (data) => api.post('/api/users', data),
  toggleStatus: (id) => api.put(`/api/users/${id}/toggle-status`),
};

export const projectsAPI = {
  getAll: () => api.get('/api/projects'),
  getOne: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
};

export const tasksAPI = {
  getAll: (params) => api.get('/api/tasks', { params }),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  getComments: (taskId) => api.get(`/api/tasks/${taskId}/comments`),
  addComment: (taskId, content) => api.post(`/api/tasks/${taskId}/comments`, { task_id: taskId, content }),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getMyTasks: () => api.get('/api/dashboard/my-tasks'),
  getTeamPerformance: () => api.get('/api/dashboard/team-performance'),
  getActivities: (params) => api.get('/api/activities', { params }),
};

export default api;
