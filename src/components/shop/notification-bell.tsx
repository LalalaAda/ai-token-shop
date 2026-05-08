'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  ORDER_STATUS: '📦',
  PAYMENT: '💰',
  SYSTEM: '🔔',
  PROMOTION: '🎉',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=5');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (e) {
      // Silently fail - user might not be logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="w-5 h-5 text-blue-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold">消息通知</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Check className="w-3 h-3" />
                全部已读
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">暂无通知</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => setShowDropdown(false)}
                  className={`block p-3 border-b last:border-0 hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/shop/user"
            onClick={() => setShowDropdown(false)}
            className="block p-2 text-center text-sm text-blue-600 hover:bg-gray-50 border-t"
          >
            查看全部
          </Link>
        </div>
      )}
    </div>
  );
}
