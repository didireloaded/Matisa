import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { useAuthStore } from "@/stores/authStore";

export function usePushNotifications() {
  const { session } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      // Skip if no App ID is provided yet
      if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID_HERE') {
        console.warn('OneSignal App ID is missing. Push notifications are disabled.');
        return;
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
          },
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing OneSignal:', error);
      }
    };

    initOneSignal();
  }, []);

  // Sync user with OneSignal when auth changes
  useEffect(() => {
    const syncUser = async () => {
      if (isInitialized && session?.user?.id) {
        // Link the current device to the Supabase User ID
        await OneSignal.login(session.user.id);
      } else if (isInitialized && !session) {
        // Unlink device on logout
        await OneSignal.logout();
      }
    };

    syncUser();
  }, [session, isInitialized]);

  const requestPermission = async () => {
    if (!isInitialized) return;
    await OneSignal.Slidedown.promptPush();
  };

  return { isInitialized, requestPermission };
}
