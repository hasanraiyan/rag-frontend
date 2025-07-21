import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light', // 'light' or 'dark'
  sidebarOpen: false,
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false,
  notifications: [], // Array of notification objects
  unreadNotificationsCount: 0,
  modals: {}, // { modalName: isOpen }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      state.theme = newTheme;
    },
    setTheme: (state, action) => {
      localStorage.setItem('theme', action.payload);
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        read: false,
        timestamp: new Date().toISOString(),
        showAsToast: action.payload.showAsToast !== false, // Default to true if not specified
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadNotificationsCount += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadNotificationsCount = 0;
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
        }
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotificationsCount = 0;
    },
    setModal: (state, action) => {
      state.modals = {
        ...state.modals,
        [action.payload.name]: action.payload.isOpen,
      };
    },
    setSidebarCollapsed: (state, action) => {
      localStorage.setItem('sidebarCollapsed', action.payload);
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  setModal,
  setSidebarCollapsed,
} = uiSlice.actions;

export default uiSlice.reducer;