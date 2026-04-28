import axios from 'axios';

const adminMaintenanceApi = axios.create({
  baseURL: '/api/admin/tickets',
  timeout: 60_000,
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

export const updateTicketStatus = async (id, statusOrPayload) => {
  const payload = typeof statusOrPayload === 'string'
    ? { status: statusOrPayload }
    : statusOrPayload;

  const response = await adminMaintenanceApi.patch(`/${id}/status`, payload);
  return response.data;
};

export const assignTechnicianToTicket = async (id, technicianId) => {
  const response = await adminMaintenanceApi.patch(`/${id}/assign`, { technicianId });
  return response.data;
};

export const editAdminComment = async (ticketId, commentId, payload) => {
  const response = await adminMaintenanceApi.put(`/${ticketId}/comments/${commentId}`, payload);
  return response.data;
};

export const deleteAdminComment = async (ticketId, commentId) => {
  const response = await adminMaintenanceApi.delete(`/${ticketId}/comments/${commentId}`);
  return response.data;
};

export default adminMaintenanceApi;
