import { supabase } from "@/app/services/supabase";
import { RecommendedPlan } from "@/app/types/userPlan";


export const fetchBetterPlans = async () => {
    try {
        const { data, error } = await supabase.rpc('get_better_plans');
        if (error) {
            console.error('Error fetching better plans:', error);
            return null;
        }
        
        const recommendedPlans: RecommendedPlan[] = data.map((item: any) => ({
            unlocked: item.unlocked,
            provider: item.provider,
            data: item.data || null,
            coverage: item.coverage,
            voicemail: item.voicemail,
            price: item.price,
            network: item.network,
            call_display: item.call_display,
            call_waiting: item.call_waiting,
            suspicious_call_detection: item.suspicious_call_detection,
            hotspot: item.hotspot,
            conference_call: item.conference_call,
            video_call: item.video_call,
        }));
        return recommendedPlans; // 返回查询结果
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};