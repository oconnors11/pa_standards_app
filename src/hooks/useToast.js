import { useState, useCallback } from 'react';

let toastTimeout = null;

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 2500) => {
    if (toastTimeout) clearTimeout(toastTimeout);

    // Subtle haptic vibration for mobile users
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(type === 'error' ? [30, 40, 30] : 15);
      } catch {
        // Haptics not supported or permitted
      }
    }

    setToast({ message, type, id: Date.now() });

    toastTimeout = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
