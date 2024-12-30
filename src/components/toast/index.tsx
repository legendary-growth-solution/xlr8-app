import { Toaster, toast } from 'sonner';

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const createToast = (type: 'error' | 'success' | 'info' | 'warning') => 
  (message: string, options?: ToastOptions) => 
    toast[type](message, {
      description: options?.description,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      duration: options?.duration || 4000,
    });

export const showToast = {
  error: createToast('error'),
  success: createToast('success'),
  info: createToast('info'),
  warning: createToast('warning'),
};

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="light"
      style={{
        fontFamily: 'Public Sans, sans-serif',
      }}
      toastOptions={{
        style: {
          fontSize: '0.875rem',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)',
        },
      }}
    />
  );
} 