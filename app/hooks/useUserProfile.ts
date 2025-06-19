import {fetchUserPlan} from "@/app/services/planService";
import {useEffect, useState} from "react";
import {UserPlan} from "@/app/types/userPlan";

export const useUserProfile = (userId: string) => {
    const [plan, setPlan] = useState<UserPlan | null>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        fetchUserPlan(userId).then(({ data, error }) => {
            setPlan(data || null);
            setError(error?.message || null);
            setLoading(false);
        });
    }, [userId]);

    return { plan, loading, error };
};