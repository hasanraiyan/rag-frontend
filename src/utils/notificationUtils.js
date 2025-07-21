import { addNotification } from '../store/slices/uiSlice';
import { store } from '../store';

// Helper function to add a notification
export const createNotification = (dispatch, { title, message, type = 'info', showAsToast = true, duration = 5000 }) => {
  dispatch(
    addNotification({
      title,
      message,
      type, // 'info', 'success', 'warning', 'error'
      showAsToast,
      duration,
    })
  );
};

// Simplified toast function that uses the Redux notification system
export const showToast = (message, type = 'info', duration = 5000) => {
  if (store && store.dispatch) {
    store.dispatch(
      addNotification({
        message,
        type,
        duration,
        showAsToast: true,
      })
    );
  } else {
    console.error('Redux store not available for toast notification');
    // Fallback to browser alert if store is not available
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

// Add sample notifications for testing
export const addSampleNotifications = (dispatch) => {
  createNotification(dispatch, {
    title: 'Welcome to the Dashboard',
    message: 'You have successfully logged in to the AI Chatbot Platform.',
    type: 'success',
  });

  setTimeout(() => {
    createNotification(dispatch, {
      title: 'New Document Uploaded',
      message: 'Your document "Product Manual.pdf" has been successfully uploaded.',
      type: 'info',
    });
  }, 2000);

  setTimeout(() => {
    createNotification(dispatch, {
      title: 'Processing Complete',
      message: 'Document processing has completed with 24 chunks created.',
      type: 'success',
    });
  }, 4000);
};