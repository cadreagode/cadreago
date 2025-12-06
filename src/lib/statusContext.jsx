import React, { createContext, useContext, useState, useCallback } from 'react';

const StatusContext = createContext(null);

export const StatusProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [notifications, setNotifications] = useState([]); // { id, type, message }

  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage('');
  }, []);

  const notify = useCallback((type = 'info', message = '') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, message }]);
    // Auto-remove after 4.5s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <StatusContext.Provider value={{ loading, loadingMessage, showLoading, hideLoading, notifications, notify, removeNotification }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatus must be used within a StatusProvider');
  return ctx;
};

export default StatusContext;
