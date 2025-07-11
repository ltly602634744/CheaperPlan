// src/supabase/database.ts
import { supabase } from "@/app/services/supabase";

export const fetchUserPlan = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .select('user_id, provider, data, coverage, voicemail, price, network, call_display, call_waiting, suspicious_call_detection, hotspot, conference_call, video_call')
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
    }>) => {
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .insert({
            user_id: userId,
            provider: userPlan.provider,
            data: userPlan.data,
            coverage: userPlan.coverage,
            voicemail: userPlan.voicemail,
            price: userPlan.price,
            network: userPlan.network,
            call_display: userPlan.call_display,
            call_waiting: userPlan.call_waiting,
            suspicious_call_detection: userPlan.suspicious_call_detection,
            hotspot: userPlan.hotspot,
            conference_call: userPlan.conference_call,
            video_call: userPlan.video_call,
        });

    return { data, error };
};


export const updateUserPlan = async (userId: string,
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
    }>) => {
    const { data, error } = await supabase
        .from('user_mobile_plans')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
    return { data, error };
};
