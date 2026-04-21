import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Calendar, Ticket, MessageSquare, Info, Filter, ArrowLeft } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, BOOKING, TICKET, COMMENT
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.read;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="text-blue-500" size={18} />;
      case 'TICKET': return <Ticket className="text-amber-500" size={18} />;
      case 'COMMENT': return <MessageSquare className="text-emerald-500" size={18} />;
      default: return <Info className="text-slate-500" size={18} />;
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-['Playfair_Display',serif] uppercase tracking-tight">
              Notifications
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage your campus alerts and updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Check size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-slate-400 mr-2" />
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Unread', value: 'UNREAD' },
            { label: 'Bookings', value: 'BOOKING' },
            { label: 'Tickets', value: 'TICKET' },
            { label: 'Comments', value: 'COMMENT' }
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === btn.value
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
              <p className="text-sm font-bold">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 flex gap-4 hover:bg-slate-50 transition-all relative group border-l-4 ${
                  notification.type === 'BOOKING' ? 'border-l-blue-500 bg-blue-50/5' :
                  notification.type === 'TICKET' ? 'border-l-amber-500 bg-amber-50/5' :
                  notification.type === 'COMMENT' ? 'border-l-emerald-500 bg-emerald-50/5' :
                  'border-l-slate-300'
                } ${!notification.read ? '' : 'opacity-60 grayscale-[0.3]'}`}
              >
                {!notification.read && (
                  <div className="absolute right-4 top-4 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40"></div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border ${!notification.read ? 'bg-white border-primary/20 shadow-sm' : 'bg-slate-100 border-transparent'
                  }`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className={`text-base font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        <span className={`px-2 py-0.5 rounded-md ${notification.type === 'BOOKING' ? 'bg-blue-50 text-blue-600' :
                            notification.type === 'TICKET' ? 'bg-amber-50 text-amber-600' :
                              notification.type === 'COMMENT' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-slate-100 text-slate-600'
                          }`}>
                          {notification.type}
                        </span>
                        <span>•</span>
                        <span>{formatFullDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${!notification.read ? 'text-slate-500' : 'text-slate-400'}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-xl shadow-sm border border-primary/10 transition-all"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No notifications found</h3>
              <p className="text-slate-500 mt-2 mb-6">You're all caught up with campus updates!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
