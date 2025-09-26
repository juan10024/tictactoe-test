// frontend/src/components/ui/toaster.tsx
/*
 * Toaster Component (UI Shell)
 *
 * This file provides the necessary boilerplate for a toast notification system,
 * which is a common requirement in modern web applications. The actual implementation
 * details (like `useToast`) are assumed to be provided by a UI library like
 * `shadcn/ui` or a similar custom implementation. This file ensures the component
 * exists as referenced in other parts of the codebase.
 */
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'; // Assuming these are defined in a separate file or library
import { useToast } from '../../hooks/useToats'; // Assuming this hook manages toast state

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
