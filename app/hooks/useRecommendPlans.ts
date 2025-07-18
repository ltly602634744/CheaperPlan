import { fetchBetterPlans } from "@/app/services/betterPlanService";
import { RecommendedPlan } from "@/app/types/userPlan";
import { useEffect, useState } from "react";
export const useRecommendPlans = () => {
    const [betterPlans, setBetterPlans] = useState<RecommendedPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        setLoading(true);
        const plans = await fetchBetterPlans();
        setBetterPlans(plans || []);
        setLoading(false);
    };

    useEffect(() => {
        refetch();
    }, []);

    return { betterPlans, setBetterPlans, setLoading, refetch };
};

