import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './components/Auth';
import Profile from './components/Profile';
import { View } from 'react-native';
import { Session } from '@supabase/supabase-js';

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log('Error logging out:', error.message);
        } else {
            setSession(null); // 重置 session 状态
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {!session ? <Auth /> : <Profile session={session} onLogout={handleLogout} />}
        </View>
    );
}

