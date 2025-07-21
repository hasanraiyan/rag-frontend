import api from './api';

class ChatbotService {
  // Get all chatbots for the current company
  async getChatbots() {
    const response = await api.get('/chatbots');
    return response.data;
  }

  // Get a specific chatbot by ID
  async getChatbot(id) {
    const response = await api.get(`/chatbots/${id}`);
    return response.data;
  }

  // Create a new chatbot
  async createChatbot(data) {
    const response = await api.post('/chatbots', data);
    return response.data;
  }

  // Update an existing chatbot
  async updateChatbot(id, data) {
    const response = await api.put(`/chatbots/${id}`, data);
    return response.data;
  }

  // Delete a chatbot
  async deleteChatbot(id) {
    const response = await api.delete(`/chatbots/${id}`);
    return response.data;
  }

  // Get documents assigned to a chatbot
  async getChatbotDocuments(chatbotId) {
    const response = await api.get(`/chatbots/${chatbotId}/documents`);
    return response.data;
  }

  // Assign a document to a chatbot
  async assignDocument(chatbotId, documentId) {
    const response = await api.post(`/chatbots/${chatbotId}/documents/${documentId}`);
    return response.data;
  }

  // Unassign a document from a chatbot
  async unassignDocument(chatbotId, documentId) {
    const response = await api.delete(`/chatbots/${chatbotId}/documents/${documentId}`);
    return response.data;
  }

  // Generate or get public link for a chatbot
  async generatePublicLink(chatbotId) {
    const response = await api.post(`/chatbots/${chatbotId}/public-link`);
    return response.data;
  }

  // Get public link for a chatbot
  async getPublicLink(chatbotId) {
    const response = await api.get(`/chatbots/${chatbotId}/public-link`);
    return response.data;
  }

  // Enable or disable public link
  async togglePublicLink(chatbotId, enabled) {
    const response = await api.patch(`/chatbots/${chatbotId}/public-link`, { enabled });
    return response.data;
  }

  // Update chatbot branding settings
  async updateBranding(chatbotId, branding) {
    const response = await api.patch(`/chatbots/${chatbotId}/branding`, branding);
    return response.data;
  }

  // Get widget integration code
  async getWidgetCode(chatbotId) {
    const response = await api.get(`/chatbots/${chatbotId}/widget-code`);
    return response.data;
  }

  // Test chatbot configuration
  async testChatbot(chatbotId, message) {
    const response = await api.post(`/chatbots/${chatbotId}/test`, { message });
    return response.data;
  }
}

export default new ChatbotService();