'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '../utils/useSettings';

export const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastPollTime, setLastPollTime] = useState(null);
  const router = useRouter();
  const { settings } = useSettings();

  // Ref to keep latest notifications for useEffect without dependency issues
  const allNotificationsRef = useRef(allNotifications);
  useEffect(() => {
    allNotificationsRef.current = allNotifications;
  }, [allNotifications]);

  const notifications = allNotifications.slice(0, 3); // Show only the 3 latest

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = allNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [allNotifications]);

  // Function to add a new notification
  const addNotification = useCallback((email) => {
    if (!email || !email.messageId || !email.date) {
      console.warn('⚠️ Skipping invalid email data:', email);
      return;
    }

    const newNotification = {
      id: email.messageId || Date.now().toString(),
      message: `New email from ${email.from}: ${email.subject}`,
      timestamp: new Date(email.date).toISOString(),
      read: false,
      email: email
    };

    setAllNotifications(prev => {
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) {
        console.log('🔁 Duplicate notification skipped:', newNotification.id);
        return prev;
      }
      return [newNotification, ...prev];
    });

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📬 New Email Received', {
        body: `Subject: ${email.subject}`,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAllNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const handleNotificationClick = useCallback((notification) => {
    markAsRead(notification.id);
    router.push('/applications');
  }, [markAsRead, router]);

  // Poll for new emails periodically
  useEffect(() => {
  let isPolling = true;
  const refreshInterval = settings?.dashboard?.refreshInterval || 5; // minutes
  const pollInterval = refreshInterval * 60 * 1000;

  const pollEmails = async () => {
    if (!isPolling) return;

    console.log('🔄 Polling for new emails...');
    console.log('Current notifications count:', allNotificationsRef.current.length);

    try {
      const response = await fetch('/api/get-emails?date=' + new Date().toISOString().split('T')[0]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Fetch failed: ${response.status}`, errorText);
        return;
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.emails)) {
        console.error('❌ Invalid email response:', data);
        return;
      }

      const emails = data.emails;
      console.log(`📨 Received ${emails.length} emails`);

      const latestNotificationTime = allNotificationsRef.current[0]?.timestamp
        ? new Date(allNotificationsRef.current[0].timestamp).getTime()
        : 0;

      emails.forEach(email => {
        const emailTime = new Date(email.date).getTime();
        if (emailTime > latestNotificationTime) {
          addNotification(email);
        }
      });

      setLastPollTime(new Date().toISOString());

    } catch (error) {
      console.error('❌ Error during email polling:', error);
    }
  };

  pollEmails();
  const intervalId = setInterval(pollEmails, pollInterval);

  return () => {
    isPolling = false;
    clearInterval(intervalId);
  };
}, [settings?.dashboard?.refreshInterval, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        allNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        lastPollTime
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
