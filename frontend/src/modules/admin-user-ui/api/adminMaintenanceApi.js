import axios from 'axios';

const adminMaintenanceApi = axios.create({
  baseURL: '/api/admin/tickets',
});

adminMaintenanceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllTickets = async () => {
  const response = await adminMaintenanceApi.get('');
  return response.data;
};

export const getTicketDetails = async (id) => {
  const response = await adminMaintenanceApi.get(`/${id}`);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await adminMaintenanceApi.patch(`/${id}/status`, { status });
  return response.data;
};

export const assignTechnicianToTicket = async (id, technicianId) => {
  const response = await adminMaintenanceApi.patch(`/${id}/assign`, { technicianId });
  return response.data;
};

export default adminMaintenanceApi;
