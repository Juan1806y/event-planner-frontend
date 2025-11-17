import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, message, duration = 4000) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification
  };
};