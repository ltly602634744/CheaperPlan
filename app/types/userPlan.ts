// src/types/userPlan.ts

import { Country } from "@/app/services/countryService";

export interface UserPlan {
    provider: string;
    data: number | null;
    coverage: Country[];
    voicemail: boolean;
    price: number;
    network: string;
    call_display: boolean;
    call_waiting: boolean;
    suspicious_call_detection: boolean;
    hotspot: boolean;
    conference_call: boolean;
    video_call: boolean;
    // minutes: number | null;
}

export interface RecommendedPlan extends UserPlan {
    savings: number; // 相比当前套餐的节省金额
}