import axios from 'axios';

// Set VITE_API_URL in your .env file, e.g. VITE_API_URL=http://localhost:8000/api/v1
// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log every request
    console.log(
      '[API REQUEST]',
      config.method?.toUpperCase(),
      config.url,
      (() => {
        try {
          return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        } catch {
          return config.data;
        }
      })()
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    // Log every response
    console.log('[API RESPONSE]', response.config.method?.toUpperCase(), response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Enhanced error logging
    console.group('[API ERROR]');
    console.error('Request:', {
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      data: originalRequest?.data,
      headers: originalRequest?.headers
    });
    console.error('Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    console.error('Error:', error.message);
    console.groupEnd();
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('[AUTH] Attempting token refresh');
        
        // Call refresh token endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
          { refreshToken }
        );
        
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        console.log('[AUTH] Token refresh successful');
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[AUTH] Token refresh failed:', refreshError);
        
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;