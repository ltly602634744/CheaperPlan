// src/supabase/database.ts


import {supabase} from "@/app/services/supabase";

export const fetchUserPlan = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .select('user_id, provider, data, coverage, voicemail, price')
        .eq('user_id', userId)
        .single();
    return { data, error };
};

export const deleteUserPlan = async (userId: string) => {
    const { error } = await supabase
        .from('user_mobile_plans')
        .delete()
        .eq('user_id', userId)
    return { error };
}

export const createUserPlan = async (userId: string,
                                     userPlan: Partial<{ provider: string; data: number | null; coverage: string; voicemail: boolean; price: number }>) =>{
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .insert({
            user_id: userId,
            provider: userPlan.provider,
            data: userPlan.data,
            coverage: userPlan.coverage,
            voicemail: userPlan.voicemail,
            price: userPlan.price,
        });

    return { data, error };
};


export const updateUserPlan = async (userId: string,
                                     updates: Partial<{ provider: string; data: number | null; coverage: string; voicemail: boolean; price: number }>) =>{
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
    return { data, error };
};

// export const updateUserProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Row']>) => {
//     const { data, error } = await supabase
//         .from('profiles')
//         .update(updates)
//         .eq('id', userId)
//         .select()
//         .single();
//     return { data, error };
// };