import {fetchUserPlan} from "@/app/services/planService";
import {useEffect, useState} from "react";
import {UserPlan} from "@/app/types/userPlan";

export const useUserProfile = (userId: string) => {
    const [plan, setPlan] = useState<UserPlan | null>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        setLoading(true);
        const { data, error } = await fetchUserPlan(userId);
        setPlan(data || null);
        setError(error?.message || null);
        setLoading(false);
    };

    useEffect(() => {
        if (!userId) return;
        fetchUserPlan(userId).then(({ data, error }) => {
            setPlan(data || null);
            setError(error?.message || null);
            setLoading(false);
        });
    }, [userId]);

    return { plan, loading, error, refetch };
};