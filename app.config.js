import 'dotenv/config';

export default {
    expo: {
        name: 'cheaper_plan_frontend',
        slug: 'cheaper_plan_frontend',
        extra: {
            dbUrl: process.env.SUPABASE_URL,
            dbANONKey: process.env.SUPABASE_ANON_KEY,
        },
        scheme: 'cheaperplan', // 添加此行，替换为您的应用标识
    },
};