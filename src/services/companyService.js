import api from './api';
import { logApiRequest, logApiResponse, logApiError } from '../utils/debugUtils';

const CompanyService = {
  /**
   * Get the current user's company
   * @returns {Promise} Promise with company data
   */
  getCurrentCompany: async () => {
    try {
      const response = await api.get('/companies/me');
      logApiResponse('GET', '/companies/me', response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('GET', '/companies/me', error);
      throw error;
    }
  },

  /**
   * Update company details
   * @param {string} companyId - Company ID
   * @param {Object} companyData - Company data to update
   * @returns {Promise} Promise with updated company data
   */
  updateCompany: async (companyId, companyData) => {
    try {
      // Make sure we're only sending fields that have values
      const cleanedData = Object.fromEntries(
        Object.entries(companyData).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );
      
      logApiRequest('PUT', `/companies/${companyId}`, cleanedData);
      const response = await api.put(`/companies/${companyId}`, cleanedData);
      logApiResponse('PUT', `/companies/${companyId}`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('PUT', `/companies/${companyId}`, error);
      throw error;
    }
  },

  /**
   * Get team members for a company
   * @param {string} companyId - Company ID
   * @returns {Promise} Promise with team members data
   */
  getTeamMembers: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/members`);
      logApiResponse('GET', `/companies/${companyId}/members`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('GET', `/companies/${companyId}/members`, error);
      throw error;
    }
  },

  /**
   * Update team member role or status
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Promise with updated user data
   */
  updateTeamMember: async (companyId, userId, userData) => {
    try {
      logApiRequest('PUT', `/companies/${companyId}/members/${userId}`, userData);
      const response = await api.put(`/companies/${companyId}/members/${userId}`, userData);
      logApiResponse('PUT', `/companies/${companyId}/members/${userId}`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('PUT', `/companies/${companyId}/members/${userId}`, error);
      throw error;
    }
  },

  /**
   * Remove team member from company
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @returns {Promise} Promise with response
   */
  removeTeamMember: async (companyId, userId) => {
    try {
      logApiRequest('DELETE', `/companies/${companyId}/members/${userId}`, null);
      const response = await api.delete(`/companies/${companyId}/members/${userId}`);
      logApiResponse('DELETE', `/companies/${companyId}/members/${userId}`, response.data, response.status);
      return response;
    } catch (error) {
      logApiError('DELETE', `/companies/${companyId}/members/${userId}`, error);
      throw error;
    }
  },

  /**
   * Create invitation to join company
   * @param {string} companyId - Company ID
   * @param {Object} invitationData - Invitation data
   * @returns {Promise} Promise with invitation data
   */
  createInvitation: async (companyId, invitationData) => {
    try {
      logApiRequest('POST', `/companies/${companyId}/invitations`, invitationData);
      const response = await api.post(`/companies/${companyId}/invitations`, invitationData);
      logApiResponse('POST', `/companies/${companyId}/invitations`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('POST', `/companies/${companyId}/invitations`, error);
      throw error;
    }
  },

  /**
   * Get all invitations for a company
   * @param {string} companyId - Company ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise with invitations data
   */
  getInvitations: async (companyId, params = {}) => {
    try {
      logApiRequest('GET', `/companies/${companyId}/invitations`, { params });
      const response = await api.get(`/companies/${companyId}/invitations`, { params });
      logApiResponse('GET', `/companies/${companyId}/invitations`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('GET', `/companies/${companyId}/invitations`, error);
      throw error;
    }
  },

  /**
   * Cancel invitation
   * @param {string} companyId - Company ID
   * @param {string} invitationId - Invitation ID
   * @returns {Promise} Promise with response
   */
  cancelInvitation: async (companyId, invitationId) => {
    try {
      logApiRequest('DELETE', `/companies/${companyId}/invitations/${invitationId}`, null);
      const response = await api.delete(`/companies/${companyId}/invitations/${invitationId}`);
      logApiResponse('DELETE', `/companies/${companyId}/invitations/${invitationId}`, response.data, response.status);
      return response;
    } catch (error) {
      logApiError('DELETE', `/companies/${companyId}/invitations/${invitationId}`, error);
      throw error;
    }
  },

  /**
   * Upload company logo
   * @param {string} companyId - Company ID
   * @param {File} file - Logo file
   * @returns {Promise} Promise with upload response
   */
  uploadLogo: async (companyId, file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      logApiRequest('POST', `/companies/${companyId}/logo`, { file: file.name });
      const response = await api.post(`/companies/${companyId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      logApiResponse('POST', `/companies/${companyId}/logo`, response.data, response.status);
      return response.data;
    } catch (error) {
      logApiError('POST', `/companies/${companyId}/logo`, error);
      throw error;
    }
  }
};

export default CompanyService;