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

// export const updateUserProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Row']>) => {
//     const { data, error } = await supabase
//         .from('profiles')
//         .update(updates)
//         .eq('id', userId)
//         .select()
//         .single();
//     return { data, error };
// };