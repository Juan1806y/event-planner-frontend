import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: type || 'info',
      title: title || 'Notificación',
      message: message || 'Mensaje no disponible',
      duration
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const closeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification =>
      notification && notification.id !== id
    ));
  }, []);

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    showNotification,
    closeNotification
  };
};