import { supabase } from "@/app/services/supabase";

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email, password: password });
    console.log('SignUp result:', { data, error });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    return { error };
};

// Save token to supabase
export const savePushToken = async (userId: string, pushToken: string) => {
    console.log(`开始保存 push token: ${userId}, ${pushToken}`);
    
    // 由于 RLS 限制，我们无法查看其他用户的记录
    // 采用 "直接尝试更新，失败后处理" 的策略
    
    try {
        // 步骤1: 检查当前用户是否已有 profile 记录
        const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profile')
            .select('user_id, exponent_push_token')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 没有找到记录
            console.error('查询用户 profile 失败:', fetchError.message);
            return { error: fetchError };
        }

        // 步骤2: 根据是否存在记录来决定插入或更新
        if (existingProfile) {
            console.log('用户已有 profile 记录，准备更新 token');
            // 用户已有记录，直接更新 token
            const { error: updateError } = await supabase
                .from('user_profile')
                .update({ exponent_push_token: pushToken })
                .eq('user_id', userId);
            
            if (updateError) {
                console.log('更新 token 失败:', updateError.message);
                // 如果是唯一约束错误，说明其他用户在使用此 token
                if (updateError.message.includes('duplicate key value violates unique constraint')) {
                    console.log('检测到 token 冲突，尝试使用函数处理...');
                    return await handleTokenConflictWithFunction(userId, pushToken);
                }
                return { error: updateError };
            } else {
                console.log('更新用户 token 成功');
                return { error: null };
            }
        } else {
            console.log('用户没有 profile 记录，准备插入新记录');
            // 用户没有记录，插入新记录
            const { error: insertError } = await supabase
                .from('user_profile')
                .insert({
                    user_id: userId,
                    exponent_push_token: pushToken
                });
            
            if (insertError) {
                console.log('插入 token 失败:', insertError.message);
                // 如果是唯一约束错误，说明其他用户在使用此 token
                if (insertError.message.includes('duplicate key value violates unique constraint')) {
                    console.log('检测到 token 冲突，尝试使用函数处理...');
                    return await handleTokenConflictWithFunction(userId, pushToken);
                }
                return { error: insertError };
            } else {
                console.log('插入用户 token 成功');
                return { error: null };
            }
        }

    } catch (err) {
        console.error('保存推送 token 发生异常:', err);
        return { error: err as Error };
    }
}

// 处理 token 冲突的辅助函数
const handleTokenConflictWithFunction = async (userId: string, pushToken: string) => {
    try {
        console.log('使用数据库函数处理 token 冲突...');
        
        // 调用数据库函数来处理冲突
        const { error } = await supabase.rpc(
            'handle_push_token_conflict', 
            { 
                target_user_id: userId, 
                new_push_token: pushToken 
            }
        );
        
        if (error) {
            console.error('数据库函数处理失败:', error.message);
            return { error };
        } else {
            console.log('数据库函数处理成功');
            return { error: null };
        }
    } catch (err) {
        console.error('数据库函数调用异常:', err);
        return { error: err as Error };
    }
}