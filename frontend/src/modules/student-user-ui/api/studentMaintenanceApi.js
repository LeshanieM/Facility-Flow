import axios from 'axios';

const studentMaintenanceApi = axios.create({
  baseURL: '/api',
});

studentMaintenanceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDashboardSummary = async () => {
  const response = await studentMaintenanceApi.get('/user/dashboard-summary');
  return response.data;
};

export const getMyRequests = async () => {
  const response = await studentMaintenanceApi.get('/requests/my');
  return response.data;
};

export const getRequestDetails = async (requestId) => {
  const response = await studentMaintenanceApi.get(`/requests/${requestId}`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await studentMaintenanceApi.get('/user/notifications');
  return response.data;
};

export const createMaintenanceRequest = async (payload) => {
  const formData = new FormData();
  formData.append('title', payload.title.trim());
  formData.append('description', payload.description.trim());
  formData.append('location', payload.location.trim());
  formData.append('category', payload.category);
  formData.append('priority', payload.priority);

  if (payload.attachment) {
    formData.append('attachment', payload.attachment);
  }

  const response = await studentMaintenanceApi.post('/requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default studentMaintenanceApi;
