import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import notificationService from '../services/notificationService';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const { unreadCount, refreshNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.slice(0, 5)); // Only show last 5 in dropdown
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const { user } = useAuth();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
    }
    setIsOpen(false);
    
    const role = user?.role;

    // Navigate based on type and role
    if (notification.type === 'BOOKING') {
      if (role === 'ADMIN') {
        navigate('/admin/bookings');
      } else {
        navigate('/bookings/my');
      }
    } else if (notification.type === 'TICKET' || notification.type === 'COMMENT') {
      if (role === 'ADMIN') {
        navigate('/admin/incidents');
      } else if (role === 'TECHNICIAN') {
        navigate('/tech/tasks');
      } else {
        navigate('/maintenance');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          if (!isOpen) fetchNotifications();
          setIsOpen(!isOpen);
        }}
        className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold border-2 border-white rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group border-l-4 ${
                      notification.type === 'BOOKING' ? 'border-l-blue-500' :
                      notification.type === 'TICKET' ? 'border-l-amber-500' :
                      notification.type === 'COMMENT' ? 'border-l-emerald-500' :
                      'border-l-slate-300'
                    } ${!notification.read ? 'bg-primary/5' : 'opacity-60'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1.5 text-primary hover:bg-white rounded-lg transition-all border border-primary/10 shadow-sm"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Bell size={24} className="opacity-20" />
                </div>
                <p className="text-sm font-medium">No new notifications</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
            <button 
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              View All Notifications <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
