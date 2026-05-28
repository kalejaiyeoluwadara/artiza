import { useApp } from "../context/AppContext";

export const useToast = () => {
  const { addToast } = useApp();
  
  return {
    success: (message: string, duration?: number) => addToast(message, "success", duration),
    error: (message: string, duration?: number) => addToast(message, "error", duration),
    info: (message: string, duration?: number) => addToast(message, "info", duration)
  };
};
