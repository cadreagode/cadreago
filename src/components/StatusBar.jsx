import React from 'react';
import { useStatus } from '../lib/statusContext';

export const StatusBar = () => {
  const { loading, loadingMessage, notifications, removeNotification } = useStatus();

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm absolute inset-0" />
          <div className="relative z-50 p-4 rounded-lg bg-white shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium text-gray-800">{loadingMessage || 'Please wait...'}</div>
          </div>
        </div>
      )}

      <div className="fixed right-4 top-4 z-60 flex flex-col gap-2">
        {notifications.map((n) => (
          <div key={n.id} className={`max-w-sm w-full rounded-md p-3 shadow-md text-sm text-white ${n.type === 'error' ? 'bg-red-600' : n.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="truncate">{n.message}</div>
              <button onClick={() => removeNotification(n.id)} className="text-white/80 hover:text-white">✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StatusBar;
