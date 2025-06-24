import {useEffect, useState} from "react";
import {fetchUserPlan} from "@/app/services/planService";
import {useAuthContext} from "@/app/context/AuthContext";

export const usePlanActions = ()=>{
    const {session} = useAuthContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const [plan, setPlan] = useState({
        provider: '',
        data: null as number | null,
        coverage: '',
        voicemail: false,
        price: 0,
    });
    useEffect(() => {
        const loadCurrentPlan = async () => {
            if (session?.user.id) {
                const { data, error } = await fetchUserPlan(session.user.id);
                if (data) {
                    setPlan({
                        provider: data.provider || '',
                        data: data.data || null,
                        coverage: data.coverage || '',
                        voicemail: data.voicemail || false,
                        price: data.price || 0,
                    });
                    setIsUpdating(true);
                } else {
                    setIsUpdating(false);
                }
            }
        };
        loadCurrentPlan();
    }, [session?.user.id]);

    return {plan, setPlan, isUpdating, session};
};