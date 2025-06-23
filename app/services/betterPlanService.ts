import {supabase} from "@/app/services/supabase";


export const fetchBetterPlans = async () => {
    try {
        const { data, error } = await supabase.rpc('get_better_plans');
        if (error) {
            console.error('Error fetching better plans:', error);
            return null;
        }
        console.log('Users:', data);
        return data; // 返回查询结果
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};