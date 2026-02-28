import { toast } from "sonner";

// Success toast
export const showSuccess = (message: string) => {
  toast.success(message);
};

// Error toast
export const showError = (message: string) => {
  toast.error(message);
};

// Info toast
export const showInfo = (message: string) => {
  toast.info(message);
};

// Warning toast
export const showWarning = (message: string) => {
  toast.warning(message);
};

// Promise toast for async operations
export const showPromise = (
  promise: Promise<any>,
  {
    loading = "Loading...",
    success = "Operation completed successfully!",
    error = "Operation failed",
  }: {
    loading?: string;
    success?: string;
    error?: string;
  } = {}
) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  });
};