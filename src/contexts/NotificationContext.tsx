'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ViewVORequest {
  patientId: string;
  voNumber: string;
  targetTab: 'my-vos' | 'shared-vos';
}

interface NotificationContextType {
  viewVORequest: ViewVORequest | null;
  requestViewVO: (request: ViewVORequest) => void;
  clearViewVORequest: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [viewVORequest, setViewVORequest] = useState<ViewVORequest | null>(null);

  const requestViewVO = (request: ViewVORequest) => {
    setViewVORequest(request);
  };

  const clearViewVORequest = () => {
    setViewVORequest(null);
  };

  return (
    <NotificationContext.Provider value={{ viewVORequest, requestViewVO, clearViewVORequest }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
