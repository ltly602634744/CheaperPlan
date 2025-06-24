import {fetchUserPlan} from "@/app/services/planService";
import {useEffect, useState} from "react";
import {UserPlan} from "@/app/types/userPlan";
import {useAuthContext} from "@/app/context/AuthContext";
import {User} from "@/app/types/user";


export const useUserProfile = () => {
    const [plan, setPlan] = useState<UserPlan | null>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {session} = useAuthContext();
    const user: User = {
        id: session?.user?.id || '',
        email: session?.user?.email || '',
        cratedAt: session?.user?.created_at || '',
    }


    const refetch = async () => {
        setLoading(true);
        try {
            const { data, error } = await fetchUserPlan(user.id);
            setPlan(data || null);
            setError(error?.message || null);
        } catch (err) {
            setError('Failed to fetch plan');
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        if (!user.id) return;
        if (user.id) {
            refetch(); // ✅ 返回时刷新最新 Plan 数据
        }
    }, [user.id]);

    return { user, plan, loading, error, refetch };
};