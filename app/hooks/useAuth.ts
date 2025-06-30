import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/app/services/supabase";
import {signIn, signOut, signUp} from "@/app/services/authService";

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    console.log("useAuth");

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { session, loading, signIn, signUp, signOut };
};