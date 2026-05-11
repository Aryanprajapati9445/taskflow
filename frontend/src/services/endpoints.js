import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
};

export const taskService = {
  getMyTasks: (params) => api.get('/tasks', { params }),
  getById:    (id)     => api.get(`/tasks/${id}`),
  create:     (data)   => api.post('/tasks', data),
  update:     (id, data) => api.put(`/tasks/${id}`, data),
  delete:     (id)     => api.delete(`/tasks/${id}`),
  getAll:     (params) => api.get('/tasks/all', { params }),
};

export const userService = {
  getAll:      (params) => api.get('/users', { params }),
  getById:     (id)     => api.get(`/users/${id}`),
  updateRole:  (id, role) => api.patch(`/users/${id}/role`, { role }),
  deactivate:  (id)     => api.delete(`/users/${id}`),
  activate:    (id)     => api.patch(`/users/${id}/activate`),
};
