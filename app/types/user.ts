export interface User {
    id: string;
    email: string;
    createdAt: string;
    premium: string;
    coins: number;
    premium_expiration_date: Date | null;
}