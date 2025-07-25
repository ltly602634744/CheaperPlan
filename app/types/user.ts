export interface User {
    id: string;
    email: string;
    createdAt: string;
    premium: string;
    premium_expiration_date: Date | null;
}