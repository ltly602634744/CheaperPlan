import { registerForPushNotificationsAsync } from '@/app/services/pushNotificationService';
import { supabase } from "@/app/services/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
        email: email, 
        password: password,
        options: {
            emailRedirectTo: 'https://www.cheaperplan.net/welcome/'
        }
    });
    console.log('SignUp result:', { data, error });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password });
    
    // 登录成功后异步保存 push token
    if (!error && data.session?.user?.id) {
        console.log('登录成功，异步保存 push token');
        // 使用 setTimeout 让 push token 保存在下一个事件循环中执行，避免阻塞UI
        setTimeout(() => {
            registerAndSavePushToken(data.session.user.id);
        }, 0);
    }
    
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    return { error };
};

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.cheaperplan.net/reset-password',
    });
    return { error };
};

export const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
};

// 密码重置状态管理器
export class PasswordResetStateManager {
    private static readonly STORAGE_KEY = 'password_reset_state';
    private static readonly STATE_EXPIRY_HOURS = 1; // 1小时过期
    
    static async setPasswordResetMode(value: boolean, token?: string) {
        if (value) {
            const state = {
                isActive: true,
                timestamp: Date.now(),
                token: token || '', // 存储重置token用于验证
                expiresAt: Date.now() + (this.STATE_EXPIRY_HOURS * 60 * 60 * 1000)
            };
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } else {
            await AsyncStorage.removeItem(this.STORAGE_KEY);
        }
        console.log('Password reset mode set to:', value);
    }
    
    static async isPasswordResetSession(): Promise<boolean> {
        try {
            const stateStr = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (!stateStr) return false;
            
            const state = JSON.parse(stateStr);
            
            // 检查是否过期
            if (Date.now() > state.expiresAt) {
                await this.clearExpiredState();
                return false;
            }
            
            return state.isActive === true;
        } catch (error) {
            console.error('Error checking password reset session:', error);
            return false;
        }
    }
    
    private static async clearExpiredState() {
        await AsyncStorage.removeItem(this.STORAGE_KEY);
        console.log('Cleared expired password reset state');
    }
}

// 为了向后兼容，保留旧的函数接口
export const setPasswordResetMode = (value: boolean, token?: string) => {
    return PasswordResetStateManager.setPasswordResetMode(value, token);
};

// 通用的 push token 注册和保存函数
const registerAndSavePushToken = async (userId: string) => {
    try {
        console.log('开始为用户注册并保存 push token:', userId);
        
        // 添加超时保护，防止长时间阻塞
        const timeoutPromise = new Promise<string | null>((_, reject) => {
            setTimeout(() => reject(new Error('Push token 获取超时')), 10000); // 10秒超时
        });
        
        const token = await Promise.race([
            registerForPushNotificationsAsync(),
            timeoutPromise
        ]);
        
        if (!token) {
            console.log('未获取到 push token，跳过保存');
            return;
        }

        const { error } = await savePushToken(userId, token);
        if (error) console.error('保存推送 token 失败：', error.message);
        else console.log('Push token 保存成功');
    } catch (e) {
        console.error('保存推送 token 发生异常：', e);
    }
};

// 检测当前是否为密码重置会话
export const isPasswordResetSession = async () => {
    try {
        // 使用新的状态管理器检查
        const isPersistentResetSession = await PasswordResetStateManager.isPasswordResetSession();
        if (isPersistentResetSession) {
            console.log('Password reset session detected via persistent storage');
            return true;
        }
        
        // 备用检测：检查当前 session 是否存在且有效
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return false;
        }
        
        // 如果有 session 且持久化状态显示是重置模式，则认为有效
        return session !== null && isPersistentResetSession;
    } catch (err) {
        console.error('Error in isPasswordResetSession:', err);
        return false;
    }
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