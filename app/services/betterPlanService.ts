import {supabase} from "@/app/services/supabase";
import {UserPlan} from "@/app/types/userPlan";


export const fetchBetterPlans = async () => {
    try {
        const { data, error } = await supabase.rpc('get_better_plans');
        if (error) {
            console.error('Error fetching better plans:', error);
            return null;
        }
        // console.log('Users:', data);
        const userPlans: UserPlan[] = data.map((item: any) => ({
            provider: item.provider,
            data: item.data || null,
            coverage: item.coverage,
            voicemail: item.voicemail,
            price: item.price,
        }));
        // console.log(userPlans);
        return userPlans; // 返回查询结果
    } catch (err) {
        console.error('Unexpected error:', err);
        return [];
    }
};