import { useSelector, useDispatch } from 'react-redux';
import Toast from './Toast';
import { removeNotification } from '../../store/slices/uiSlice';

function ToastContainer() {
  const { notifications } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  // Filter notifications to show only the most recent 3 as toasts
  const toastNotifications = notifications
    .filter(notification => notification.showAsToast)
    .slice(0, 3);

  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-4">
      {toastNotifications.map((notification) => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration || 5000}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;