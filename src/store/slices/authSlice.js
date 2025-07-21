import { createSlice } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';

const initialState = {
  user: null,
  tokens: {
    accessToken: '',
    refreshToken: '',
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Thunk to check authentication on app startup
export const checkAuth = () => async (dispatch) => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  console.log('[CHECK AUTH] Tokens:', { accessToken, refreshToken });
  if (accessToken && refreshToken) {
    dispatch(authSlice.actions.loginStart());
    try {
      const user = await AuthService.getCurrentUser();
      console.log('[CHECK AUTH] User:', user);
      dispatch(authSlice.actions.loginSuccess({ user, tokens: { accessToken, refreshToken } }));
    } catch (error) {
      console.log('[CHECK AUTH] Error:', error);
      dispatch(authSlice.actions.logout());
    }
  } else {
    dispatch(authSlice.actions.logout());
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = { accessToken: '', refreshToken: '' };
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, registerStart, registerSuccess, registerFailure, logout } = authSlice.actions;
export default authSlice.reducer;