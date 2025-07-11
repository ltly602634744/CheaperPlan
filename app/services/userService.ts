import { supabase } from "./supabase";

// Update user premium status
export const updateUserPremiumStatus = async (userId: string, premiumStatus: string) => {
    const { data, error } = await supabase
        .from('user_profile')
        .update({ premium: premiumStatus })
        .eq('user_id', userId)
        .select()
        .single();
    return { data, error };
};

// Get user profile
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .single();
    return { data, error };
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
    const { data, error } = await supabase
        .from('user_profile')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
    return { data, error };
}; 