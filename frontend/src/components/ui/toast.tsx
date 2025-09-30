/*
 * file: toast.tsx
 * component: Minimalist Toast UI
 * description:
 *     Provides a basic, dependency-free implementation of Toast components. 
 *     Meant to prevent "module not found" errors and serve as a placeholder. 
 *     Can be replaced with a feature-rich library like `shadcn/ui`.
 */

import React from 'react';

// Context definition (placeholder, no state management yet)
export const ToastContext = React.createContext<{
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
}>({ addToast: () => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  // A real implementation should manage toast state here
  return <>{children}</>;
};

// Container for displaying toast notifications
export const ToastViewport = () => (
  <div className="fixed bottom-0 right-0 p-4 space-y-2" />
);

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, ...props }, ref) => (
    <div
      ref={ref}
      className="relative p-4 bg-gray-900 text-white rounded-lg shadow-lg"
      {...props}
    >
      {title && <h4>{title}</h4>}
      {description && <p className="text-sm opacity-80">{description}</p>}
    </div>
  )
);

export const ToastTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-bold">{children}</h4>
);

export const ToastDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm opacity-90">{children}</p>
);

// Simple close button (no behavior attached yet)
export const ToastClose = () => (
  <button className="absolute top-2 right-2">&times;</button>
);
