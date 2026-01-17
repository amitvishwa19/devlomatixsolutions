import { useCallback, useEffect, useRef } from 'react';

// Base64 encoded simple notification sound (short beep)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodHbvYNTQD1s0ObgsHZKODBmteXVoG1ENDFdqNzUnmRBMy9XnNLLmF0+MS9RkMfDkVc8MC1LhL65ik42LitFd7OzgkgzKyc+aqqqekMwKSM3XJ+he0AuJiAyTpKXdz4sJB4tQ4aQcjspIhwoN3mJbDYnIBkkLWx/ZzMlHhggJ198YDEjHRYdImphWS8hGxQbH1xaUy0fGRMYG1BTTSseGBIWF0hLRykcFhEUFEJFQickFRETE0A/PiYjFBAQEDs5NSQgEw8QDzg2MiMfEw4PDjYzLyEeEg4ODjQxLSAdEg0NDjEvKx8cEQwNDC8tKR4bEQwMDC4rJx0aEAsLCywoJBoZEAsLCismIxkYDwoKCikkIRgXDwoKCighIBcWDwoJCSggHxYVDgkJCScdHhUUDQkJCCYcHBQTDQkICCUaGhIRDAcHByQZGRERDAgHBiMYGBARDAcGBiIXFw8QCwcGBiEWFg8PCwYGBSAVFQ4PCgYFBSAUFA4OCgYFBR8TExAOCgYFBR4TEg8NCQUEBBwSEg8NCQUFBB0REQ4MCQUEBBwREQ4MCQUEBI==';

export function useNotifications() {
  const audioRef = useRef(null);
  const permissionRef = useRef('default');

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;

    // Check notification permission
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission === 'granted';
    }

    return false;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const showDesktopNotification = useCallback((title, options) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  const notifyNewMail = useCallback((senderName, subject) => {
    playNotificationSound();
    showDesktopNotification(`New message from ${senderName}`, {
      body: subject,
      tag: 'new-mail',
    });
  }, [playNotificationSound, showDesktopNotification]);

  return {
    requestNotificationPermission,
    playNotificationSound,
    showDesktopNotification,
    notifyNewMail,
    hasNotificationPermission: permissionRef.current === 'granted',
  };
}