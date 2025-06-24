// src/types/userPlan.ts

export interface UserPlan {
    provider: string;
    data: number | null;
    coverage: string;
    voicemail: boolean;
    price: number;
    // minutes: number | null;
}

export interface RecommendedPlan extends UserPlan {
    savings: number; // 相比当前套餐的节省金额
}