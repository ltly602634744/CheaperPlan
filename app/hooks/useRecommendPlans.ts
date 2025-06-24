import {useEffect, useState} from "react";
import {UserPlan} from "@/app/types/userPlan";
import {fetchBetterPlans} from "@/app/services/betterPlanService";
export const useRecommendPlans = () => {
    const [betterPlans, setBetterPlans] = useState<UserPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        const loadPlans = async () =>{
            setLoading(true);
            const plans = await fetchBetterPlans();
            setBetterPlans(plans || []);
            // console.log(plans);
            // 假设 fetchBetterPlans 返回 { Users: BetterPlan[] }
            // setBetterPlans(plans. || []);
            setLoading(false);
        }
        loadPlans();
    }, []);
    return { betterPlans, setBetterPlans, setLoading};
}

