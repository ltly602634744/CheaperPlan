import { useAuthContext } from "@/app/context/AuthContext";
import { fetchUserPlan } from "@/app/services/planService";
import { getUserProfile } from "@/app/services/userService";
import { User } from "@/app/types/user";
import { UserPlan } from "@/app/types/userPlan";
import { useCallback, useEffect, useState } from "react";

export const useUserProfile = () => {
    const { session } = useAuthContext();

    const [user, setUser] = useState<User | null>(null);
    const [plan, setPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /** 重新拉取 profile + plan */
    const refetch = useCallback(async () => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const { data: profile, error: profileErr } = await getUserProfile(
                session.user.id, "premium,premium_expiration_date,auto_renew_enabled"
            );
            if (profileErr || !profile)
                throw profileErr ?? new Error("profile not found");

            const currentUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                createdAt: session.user.created_at || '',
                premium: profile.premium || '',
                premium_expiration_date: profile.premium_expiration_date ? new Date(profile.premium_expiration_date) : null,
                auto_renew_enabled: profile.auto_renew_enabled ?? false
            };
            setUser(currentUser);

            // ② plan
            const { data: planData, error: planErr } = await fetchUserPlan(currentUser.id);
            if (planErr) throw planErr;

            setPlan(planData ?? null);
            setError(null);
        } catch (e: any) {
            setError(e.message ?? "unknown error");
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    /** 首次 & session 变化时执行 */
    useEffect(() => {
        if (session?.user.id) refetch();
        else setLoading(false);
    }, [session?.user.id]);

    return { user, plan, loading, error, refetch };
};
