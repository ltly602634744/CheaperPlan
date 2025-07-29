import { signIn, signOut, signUp, setPasswordResetMode } from '@/app/services/authService';
import { supabase } from "@/app/services/supabase";
import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

    console.log("useAuth");

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.id);
            
            setSession(session);
            setLoading(false);
            
            // 处理登出事件，重置密码重置模式
            if (event === 'SIGNED_OUT') {
                console.log('User signed out, resetting password reset mode');
                setPasswordResetMode(false);
            }
        });

    return () => subscription.unsubscribe();
  }, []); // 移除依赖，避免重复订阅

  return { session, loading, signIn, signUp, signOut };
};
