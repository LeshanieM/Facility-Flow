import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState(null);
  const [toasts, setToasts] = useState([]);
  const prevCountRef = useRef(0);

  const fetchStatus = async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      
      // If count increased, show a toast for the newest notification
      if (count > prevCountRef.current) {
        const notifications = await notificationService.getNotifications();
        const newest = notifications[0];
        if (newest && !newest.read) {
          addToast(newest);
        }
      }
      
      setUnreadCount(count);
      prevCountRef.current = count;
    } catch (error) {
      console.error('Failed to fetch notification status:', error);
    }
  };

  const addToast = (notification) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...notification, toastId: id }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.toastId !== id));
  };

  useEffect(() => {
    if (user) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, toasts, removeToast, refreshNotifications: fetchStatus }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
