import { registerForPushNotificationsAsync } from '@/app/hooks/usePushNotifications';
import { savePushToken, signIn, signOut, signUp } from '@/app/services/authService';
import { supabase } from "@/app/services/supabase";
import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const registerAndSavePushToken = useCallback(async (userId: string) => {
    const token = await registerForPushNotificationsAsync();
    if (!token) return; // 未获取到 token—直接退出

    try {
      const { error } = await savePushToken(userId, token);
      if (error) console.error('保存推送 token 失败：', error.message);
      else console.log('Push token 保存成功');
    } catch (e) {
      console.error('保存推送 token 发生异常：', e);
    }
  }, []);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    console.log("useAuth");

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

    return () => subscription.unsubscribe();
  }, [registerAndSavePushToken]);

  return { session, loading, signIn, signUp, signOut };
};
