export interface UserProfile {
    user_id: string;
    premium: string;
    coins: number;
    premium_expiration_date: Date | null;
}