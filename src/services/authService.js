import api from './api';

const AuthService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.access_token);
      localStorage.setItem('refreshToken', response.data.tokens.refresh_token);
    }
    return response.data;
  },
  
  /**
   * Registers a new user and company.
   * @param {Object} userData - { email, password, full_name, company_name, company_slug? }
   * @returns {Promise<Object>} - { user, tokens }
   */
  register: async (userData) => {
    // API expects: email, password, full_name, company_name, company_slug (optional)
    const response = await api.post('/auth/register', userData);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.access_token);
      localStorage.setItem('refreshToken', response.data.tokens.refresh_token);
    }
    return response.data; // { user, tokens }
  },
  
  /**
   * Verify user's email address using OTP.
   * @param {Object} data - { email, otp }
   * @returns {Promise<Object>} - { message }
   */
  verifyEmail: async ({ email, otp }) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  /**
   * Reset password using OTP received via email.
   * @param {Object} data - { email, otp, new_password }
   * @returns {Promise<Object>} - { message }
   */
  resetPassword: async ({ email, otp, new_password }) => {
    const response = await api.post('/auth/reset-password', { email, otp, new_password });
    return response.data;
  },

  /**
   * Register a new user without a company.
   * @param {Object} userData - { email, password, full_name }
   * @returns {Promise<Object>} - { user, tokens }
   */
  registerSimple: async (userData) => {
    const response = await api.post('/auth/register-simple', userData);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.access_token);
      localStorage.setItem('refreshToken', response.data.tokens.refresh_token);
    }
    return response.data;
  },

  /**
   * Change user's password.
   * @param {Object} data - { current_password, new_password }
   * @returns {Promise<Object>} - { message }
   */
  changePassword: async ({ current_password, new_password }) => {
    const response = await api.post('/auth/change-password', { current_password, new_password });
    return response.data;
  },

  /**
   * Logout user by invalidating the refresh token.
   * @param {string} refresh_token
   * @returns {Promise<Object>} - { message }
   */
  logout: async (refresh_token) => {
    const response = await api.post('/auth/logout', { refresh_token });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Resend email verification OTP to the user.
   * @param {string} email
   * @returns {Promise<Object>} - { message }
   */
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

export default AuthService;