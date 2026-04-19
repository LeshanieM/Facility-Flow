import api from '../../../services/api';

export const facilityApi = {
  // USER endpoints
  getAllResources: (params) => {
    return api.get('/resources', { params });
  },
  getResourceById: (id) => {
    return api.get(`/resources/${id}`);
  },

  // ADMIN endpoints
  getAdminResources: () => {
    return api.get('/admin/resources');
  },
  createResource: (data) => {
    return api.post('/admin/resources', data);
  },
  updateResource: (id, data) => {
    return api.put(`/admin/resources/${id}`, data);
  },
  updateResourceStatus: (id, status) => {
    return api.patch(`/admin/resources/${id}/status`, null, { params: { status } });
  },
  deleteResource: (id) => {
    return api.delete(`/admin/resources/${id}`);
  }
};
