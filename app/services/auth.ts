import {supabase} from "@/app/services/supabase";

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
        // 自动创建 profiles 记录
        await supabase
            .from('profiles')
            .insert({ id: data.user.id, email });
    }
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};