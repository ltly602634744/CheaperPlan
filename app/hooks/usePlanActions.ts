import { useAuthContext } from "@/app/context/AuthContext";
import { fetchUserPlan } from "@/app/services/planService";
import { useEffect, useState } from "react";

export const usePlanActions = ()=>{
    const {session} = useAuthContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const [plan, setPlan] = useState({
        provider: '',
        data: null as number | null,
        coverage: '',
        voicemail: false,
        price: 0,
        network: '',
        call_display: false,
        call_waiting: false,
        suspicious_call_detection: false,
        hotspot: false,
        conference_call: false,
        video_call: false,
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
                        network: data.network || '',
                        call_display: data.call_display || false,
                        call_waiting: data.call_waiting || false,
                        suspicious_call_detection: data.suspicious_call_detection || false,
                        hotspot: data.hotspot || false,
                        conference_call: data.conference_call || false,
                        video_call: data.video_call || false,
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