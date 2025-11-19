import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from '../../styles/ubicaciones.module.css';

const NotificationSystem = ({ notifications = [], onClose }) => {
  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className={styles.notificationIcon} />;
      case 'error':
        return <XCircle size={20} className={styles.notificationIcon} />;
      case 'warning':
        return <AlertCircle size={20} className={styles.notificationIcon} />;
      case 'info':
        return <Info size={20} className={styles.notificationIcon} />;
      default:
        return <Info size={20} className={styles.notificationIcon} />;
    }
  };

  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => {
        if (!notification || typeof notification !== 'object') {
          return null;
        }

        return (
          <div
            key={notification.id || Math.random()}
            className={`${styles.notification} ${styles[notification.type || 'info']}`}
          >
            {getIcon(notification.type)}
            <div className={styles.notificationContent}>
              <div className={styles.notificationTitle}>
                {notification.title || 'Notificación'}
              </div>
              <div className={styles.notificationMessage}>
                {notification.message || 'Mensaje no disponible'}
              </div>
            </div>
            <button
              className={styles.notificationClose}
              onClick={() => onClose && onClose(notification.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;