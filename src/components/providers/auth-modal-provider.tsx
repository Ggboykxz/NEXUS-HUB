'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthModal } from '@/components/auth/auth-modal';

type AuthModalContextType = {
  openAuthModal: (action?: string) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string>('');

  const openAuthModal = (action: string = 'accéder à cette fonctionnalité') => {
    setAttemptedAction(action);
    setIsOpen(true);
  };

  const closeAuthModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal 
        isOpen={isOpen} 
        onClose={closeAuthModal} 
        action={attemptedAction} 
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
