import { savePushToken, signIn, signOut, signUp } from '@/app/services/authService';
import { registerForPushNotificationsAsync } from '@/app/services/pushNotificationService';
import { supabase } from "@/app/services/supabase";
import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const registerAndSavePushToken = useCallback(async (userId: string) => {
    try {
      // 添加超时保护，防止长时间阻塞
      const timeoutPromise = new Promise<string | null>((_, reject) => {
        setTimeout(() => reject(new Error('Push token 获取超时')), 10000); // 10秒超时
      });
      
      const token = await Promise.race([
        registerForPushNotificationsAsync(),
        timeoutPromise
      ]);
      
      if (!token) return; // 未获取到 token—直接退出

      const { error } = await savePushToken(userId, token);
      if (error) console.error('保存推送 token 失败：', error.message);
      else console.log('Push token 保存成功');
    } catch (e) {
      console.error('保存推送 token 发生异常：', e);
    }
  }, []);
    console.log("useAuth");

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setLoading(false);
            
            // 有会话且用户ID存在时异步获取并保存push token（不阻塞UI）
            if (session?.user?.id) {
                // 使用 setTimeout 让 push token 获取在下一个事件循环中执行，避免阻塞UI
                setTimeout(() => {
                    registerAndSavePushToken(session.user.id);
                }, 0);
            }
        });

    return () => subscription.unsubscribe();
  }, [registerAndSavePushToken]);

  return { session, loading, signIn, signUp, signOut };
};
