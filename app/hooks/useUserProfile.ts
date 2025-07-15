import { useAuthContext } from "@/app/context/AuthContext";
import { fetchUserPlan } from "@/app/services/planService";
import { getUserProfile } from "@/app/services/userService";
import { User } from "@/app/types/user";
import { UserPlan } from "@/app/types/userPlan";
import { useEffect, useState } from "react";

export const useUserProfile = () => {
    const { session } = useAuthContext();

    const [user, setUser] = useState<User | null>(null);
    const [plan, setPlan] = useState<UserPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /** 重新拉取 profile + plan */
    const refetch = async () => {
        try {
            setLoading(true);
            const { data: profile, error: profileErr } = await getUserProfile(
                session!.user!.id, "premium,coins"
            );
            if (profileErr || !profile)
                throw profileErr ?? new Error("profile not found");

            const currentUser: User = {
                id: session?.user?.id || '',
                email: session?.user?.email || '',
                cratedAt: session?.user?.created_at || '',
                premium: profile.premium || '',
                coins: profile.coins || 0,
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
    };

    /** 首次 & session 变化时执行 */
    useEffect(() => {
        if (session?.user.id) refetch();
        else setLoading(false);
    }, [session?.user.id]);

    return { user, plan, loading, error, refetch };
};
