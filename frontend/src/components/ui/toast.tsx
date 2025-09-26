// frontend/src/components/ui/toast.tsx
/*
 * Minimalist Toast Component (Functional)
 *
 * This provides a basic, functional implementation for the Toast UI components.
 * It's designed to be dependency-free and satisfy the imports from the Toaster.
 * This avoids "module not found" errors during development.
 * You can replace this with a more feature-rich library like `shadcn/ui` later.
 */
import React from 'react';

// Basic context for managing toasts
export const ToastContext = React.createContext<{
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
}>({ addToast: () => {} });

// Component wrappers with basic styling
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  // A real implementation would have state management here.
  // For now, it just renders children.
  return <>{children}</>;
};

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
      className="p-4 bg-gray-900 text-white rounded-lg shadow-lg"
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

export const ToastClose = () => (
  <button className="absolute top-2 right-2">&times;</button>
);