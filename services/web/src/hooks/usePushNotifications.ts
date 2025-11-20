import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../lib/firebase';
import { saveDeviceToken } from '../lib/api';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const msg = await messaging();
      if (!msg) {
        console.warn('Firebase Messaging not supported in this browser.');
        return false;
      }

      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === 'granted') {
        // FIX: Register the service worker explicitly if not found, or rely on default
        // This helps ensures the scope is correct before asking for token
        
        const token = await getToken(msg, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          await saveDeviceToken(token);
          console.log('FCM Token saved:', token);
          return true;
        }
      } else {
        toast.error('Notifications blocked. Please enable them in browser settings.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      // Don't show error toast if it's just the user dismissing the prompt
      if (error instanceof Error && error.message.includes('dismissed')) return false;
      
      toast.error('Failed to enable notifications.');
    }
    return false;
  };

  return { permission, requestPermission };
}