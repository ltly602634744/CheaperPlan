import {supabase} from "@/app/services/supabase";

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email, password: password });
    // if (!error && data.user) {
    //     // 自动创建 profiles 记录
    //     await supabase
    //         .from('profiles')
    //         .insert({ id: data.user.id, email });
    // }
    // console.log(data);
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Save token to supabase
export const savePushToken = async (userId: string, pushToken: string) => {
    const { error } = await supabase
        .from('user_profile')
        .upsert({
            user_id: userId,
            exponent_push_token : pushToken
        }, {
            onConflict: 'user_id'
        });
    return { error };
}

