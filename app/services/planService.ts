// src/supabase/database.ts
import { supabase } from "@/app/services/supabase";

export const fetchUserPlan = async () => {
    const { data, error } = await supabase.rpc('get_user_current_plan');
    return { data: data?.[0] || null, error };
};

export const deleteUserPlan = async (userId: string) => {
    const { error } = await supabase
        .from('user_mobile_plans')
        .delete()
        .eq('user_id', userId)
    return { error };
}

export const createUserPlan = async (
    userPlan: Partial<{
        provider: string;
        data: number | null;
        coverage: string;
        voicemail: boolean;
        price: number;
        network: string;
        call_display: boolean;
        call_waiting: boolean;
        suspicious_call_detection: boolean;
        hotspot: boolean;
        conference_call: boolean;
        video_call: boolean;
        coverage_ids?: number[];
    }>) => {
    const { data, error } = await supabase.rpc('create_user_mobile_plan', {
        p_provider: userPlan.provider,
        p_data: userPlan.data,
        p_price: userPlan.price,
        p_network: userPlan.network,
        p_voicemail: userPlan.voicemail,
        p_call_display: userPlan.call_display,
        p_call_waiting: userPlan.call_waiting,
        p_suspicious_call_detection: userPlan.suspicious_call_detection,
        p_hotspot: userPlan.hotspot,
        p_conference_call: userPlan.conference_call,
        p_video_call: userPlan.video_call,
        p_coverage_ids: userPlan.coverage_ids
    });

    return { data, error };
};


export const updateUserPlan = async (
    updates: Partial<{
        provider: string;
        data: number | null;
        coverage: string;
        voicemail: boolean;
        price: number;
        network: string;
        call_display: boolean;
        call_waiting: boolean;
        suspicious_call_detection: boolean;
        hotspot: boolean;
        conference_call: boolean;
        video_call: boolean;
        coverage_ids?: number[];
    }>) => {
    const { data, error } = await supabase.rpc('update_user_mobile_plan', {
        p_provider: updates.provider,
        p_data: updates.data,
        p_price: updates.price,
        p_network: updates.network,
        p_voicemail: updates.voicemail,
        p_call_display: updates.call_display,
        p_call_waiting: updates.call_waiting,
        p_suspicious_call_detection: updates.suspicious_call_detection,
        p_hotspot: updates.hotspot,
        p_conference_call: updates.conference_call,
        p_video_call: updates.video_call,
        p_coverage_ids: updates.coverage_ids
    });
    return { data, error };
};
