import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/app/services/supabase";
import {savePushToken, signIn, signOut, signUp} from "@/app/services/authService";
import {registerForPushNotificationsAsync} from "@/app/hooks/usePushNotifications";

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const registerAndSavePushToken = async (userId: string) => {
        const token = await registerForPushNotificationsAsync();
        if (token){
            console.log('Push token:', token);
            const {error} = await savePushToken(userId, token);
            if (error){
                console.log('Error saving push token:', error);
            }else{
                console.log('Push token saved successfully!');
            }
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            if (session?.user.id){
                registerAndSavePushToken(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user.id){
                registerAndSavePushToken(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { session, loading, signIn, signUp, signOut };
};