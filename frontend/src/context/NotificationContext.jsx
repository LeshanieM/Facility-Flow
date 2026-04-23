import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();
const POLL_INTERVAL_MS = 5000;
const RETRY_INTERVAL_MS = 30000;

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const prevCountRef = useRef(0);
  const pollTimeoutRef = useRef(null);
  const hasLoggedConnectionIssueRef = useRef(false);

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const scheduleNextFetch = (delay) => {
    clearPollTimeout();
    pollTimeoutRef.current = setTimeout(() => {
      fetchStatus();
    }, delay);
  };

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
      hasLoggedConnectionIssueRef.current = false;
      scheduleNextFetch(POLL_INTERVAL_MS);
    } catch (error) {
      setUnreadCount(0);

      if (!hasLoggedConnectionIssueRef.current) {
        console.error(`Failed to fetch notification status. Retrying in ${RETRY_INTERVAL_MS / 1000} seconds.`, error);
        hasLoggedConnectionIssueRef.current = true;
      }

      scheduleNextFetch(RETRY_INTERVAL_MS);
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
    clearPollTimeout();
    prevCountRef.current = 0;
    hasLoggedConnectionIssueRef.current = false;

    if (user) {
      fetchStatus();
    } else {
      setUnreadCount(0);
    }

    return () => clearPollTimeout();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, toasts, removeToast, refreshNotifications: fetchStatus }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
