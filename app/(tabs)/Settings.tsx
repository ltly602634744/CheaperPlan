import Cell from "@/app/components/SettingCell";
import { useAuthContext } from "@/app/context/AuthContext";
import { ModalContentKey } from "@/app/data";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    AppState,
    AppStateStatus,
    NativeEventSubscription,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Purchases from 'react-native-purchases';
import { getMembershipStatusDisplay, SubscriptionInfo, SubscriptionStatus } from '../services/subscriptionService';
import { updateUserProfile } from '../services/userService';
import eventBus from '../utils/eventBus';

export default function SettingsScreen() {
    const router = useRouter();
    const { session, signOut } = useAuthContext();
    const { user, loading: profileLoading, refetch } = useUserProfile();
    const [notificationEnabled, setNotificationEnabled] = useState<string>("...");

    // 跳转到内容展示页面的函数
    const navigateToContent = (contentType: ModalContentKey) => {
        router.push(`../screens/ContentDisplayScreen?contentType=${encodeURIComponent(contentType)}`);
    };

    // 检查通知权限
    const checkNotificationPermission = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationEnabled(status === 'granted' ? 'On' : 'Off');
        } catch (e) {
            setNotificationEnabled('Unknown');
        }
    };

    // 监听AppState变化
    useEffect(() => {
        const subscription: NativeEventSubscription = AppState.addEventListener(
            'change',
            (nextAppState: AppStateStatus) => {
                if (nextAppState === 'active') {
                    checkNotificationPermission();
                }
            }
        );
        return () => subscription.remove();
    }, []);

    // 首次挂载时检查
    useEffect(() => {
        checkNotificationPermission();
    }, []);

    // 监听订阅状态更新事件
    useEffect(() => {
        const handleSubscriptionUpdate = (subscriptionData: {
            premium: string;
            premium_expiration_date: Date;
            auto_renew_enabled: boolean;
            subscriptionType: string;
        }) => {
            console.log('Settings: Received subscription update:', subscriptionData);
            // 刷新用户配置文件数据
            refetch();
        };

        eventBus.on('subscriptionUpdated', handleSubscriptionUpdate);

        return () => {
            eventBus.off('subscriptionUpdated', handleSubscriptionUpdate);
        };
    }, [refetch]);


    const handleLogOut = async () => {
        const { error } = await signOut();
        if (error) {
            Alert.alert('Error', `：${error.message}`);
        } else {
            Alert.alert('Succeed', 'Logged out successfully!');
            router.replace("/screens/AuthScreen");
        }
    }

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This action is irreversible. All your data will be permanently deleted and cannot be recovered. Are you sure you want to continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Continue',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!session?.access_token) {
                                Alert.alert('Error', 'Authentication token not found');
                                return;
                            }

                            const response = await fetch('https://www.cheaperplan.net/api/delete-account', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`,
                                },
                            });

                            if (response.ok) {
                                await signOut();
                                router.replace("/screens/AuthScreen");
                            } else {
                                const errorData = await response.json().catch(() => ({}));
                                const errorMessage = errorData.error;
                                
                                // 根据后端返回的具体错误提供用户友好的提示
                                if (errorMessage === 'Missing token') {
                                    Alert.alert('Error', 'Authentication token is missing. Please try logging out and logging back in.');
                                } else if (errorMessage === 'Invalid session') {
                                    Alert.alert('Error', 'Your session has expired. Please log in again and try deleting your account.');
                                } else if (errorMessage === 'Server misconfigured') {
                                    Alert.alert('Error', 'Server configuration error. Please contact support.');
                                } else if (errorMessage === 'Delete failed') {
                                    Alert.alert('Error', 'Account deletion failed. Please try again or contact support if the issue persists.');
                                } else {
                                    Alert.alert('Error', errorMessage || 'Failed to delete account. Please try again.');
                                }
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account. Please check your internet connection and try again.');
                        }
                    },
                },
            ]
        );
    }

    const handleRestore = async () => {
        if (!session?.user?.id) return;
        try {
            const customerInfo = await Purchases.restorePurchases();
            
            // 检查两个可能的entitlements
            const monthlyEntitlement = customerInfo.entitlements.active["one_month_access"];
            const yearlyEntitlement = customerInfo.entitlements.active["one_year_access"];
            
            // 选择有效的entitlement（优先选择到期时间更晚的）
            let activeEntitlement = null;
            let subscriptionType = '';
            
            if (monthlyEntitlement && yearlyEntitlement) {
                // 两个都存在时，选择到期时间更晚的
                const monthlyExpiry = monthlyEntitlement.expirationDate ? new Date(monthlyEntitlement.expirationDate) : new Date(0);
                const yearlyExpiry = yearlyEntitlement.expirationDate ? new Date(yearlyEntitlement.expirationDate) : new Date(0);
                
                if (yearlyExpiry >= monthlyExpiry) {
                    activeEntitlement = yearlyEntitlement;
                    subscriptionType = 'yearly';
                } else {
                    activeEntitlement = monthlyEntitlement;
                    subscriptionType = 'monthly';
                }
            } else if (yearlyEntitlement) {
                activeEntitlement = yearlyEntitlement;
                subscriptionType = 'yearly';
            } else if (monthlyEntitlement) {
                activeEntitlement = monthlyEntitlement;
                subscriptionType = 'monthly';
            }

            if (activeEntitlement) {
                const expiration = activeEntitlement.expirationDate;
                const expirationDate = expiration ? new Date(expiration) : null;
                const autoRenewEnabled = activeEntitlement.willRenew;
                
                // ✅ 调用后端接口更新数据库状态
                await updateUserProfile(session.user.id, {
                    premium: subscriptionType, // 'monthly' or 'yearly'
                    premium_expiration_date: expirationDate,
                    auto_renew_enabled: autoRenewEnabled,
                });

                // 触发会员状态更新事件
                eventBus.emit('subscriptionUpdated', {
                    premium: subscriptionType, // 'monthly' or 'yearly'
                    premium_expiration_date: expirationDate,
                    auto_renew_enabled: autoRenewEnabled,
                    subscriptionType: `restored_${subscriptionType}`
                });

                Alert.alert('✅ Restoration successful', `Your ${subscriptionType === 'yearly' ? 'one Year' : 'one month'} access pass has been restored`);
            } else {
                Alert.alert('Notice', 'No restorable purchases were found on your account.');
            }
        } catch (e) {
            if (e instanceof Error) {
                Alert.alert('Restoration failed', e.message || 'Please contact support');
            } else {
                Alert.alert('Restoration failed', 'Please contact support');
            }
        }
    };

    // 获取会员状态显示文本
    const getMembershipStatus = () => {
        if (!user) return 'Free';
        
        // 检查是否是free用户（没有premium字段或premium为空/free）
        if (!user.premium || user.premium === 'free' || user.premium === '') {
            return 'Free';
        }
        
        // 检查是否有有效的过期时间
        if (!user.premium_expiration_date) {
            return 'Free';
        }
        
        // 构建订阅信息对象用于显示
        let status: SubscriptionStatus;
        if (user.premium_expiration_date && new Date(user.premium_expiration_date) > new Date()) {
            // 根据premium字段确定具体的活跃状态
            if (user.premium === 'monthly') {
                status = 'active_monthly';
            } else if (user.premium === 'yearly') {
                status = 'active_yearly';
            } else {
                // 兼容旧数据，默认为monthly
                status = 'active_monthly';
            }
        } else {
            status = 'expired';
        }
        
        const subscriptionInfo: SubscriptionInfo = {
            status,
            expirationDate: user.premium_expiration_date,
            autoRenewEnabled: user.auto_renew_enabled,
            subscriptionType: null
        };
        
        // 为Settings页面提供更详细的状态显示
        const baseStatus = getMembershipStatusDisplay(subscriptionInfo);
        if (status === 'active_monthly' || status === 'active_yearly') {
            const renewalInfo = user.auto_renew_enabled ? ' (Auto-renew)' : ' (Expires)';
            return baseStatus + renewalInfo;
        }
        
        return baseStatus;
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* 第一组：基本信息 */}
                <View className="mt-2 bg-white shadow-sm overflow-hidden">
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Email" value={session?.user?.email || 'Not set'} onPress={() => router.push('../screens/EmailSettingScreen')} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Password" value="********" onPress={() => router.push('../screens/PasswordSettingScreen')} />
                    <Cell label="Notification" value={notificationEnabled} onPress={() => router.push('../screens/NotificationSettingScreen')} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="My subscription"
                        value={profileLoading ? '...' : getMembershipStatus()}
                        onPress={() => router.push('../screens/SubscriptionScreen')}
                    />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    {/* <Cell label="Language" value="English" onPress={() => router.push('../screens/LanguageSettingScreen')} /> */}
                    <Cell label="Restore Purchase" value="" onPress={handleRestore} />
                </View>

                {/* 第三组：展示内容 */}
                <View className="mt-3 bg-white shadow-sm overflow-hidden">
                    <Cell label="Terms of Use" onPress={() => navigateToContent("Terms of Use")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Privacy Policy" onPress={() => navigateToContent("Privacy Policy")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="About" onPress={() => navigateToContent("About")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Help Center" onPress={() => navigateToContent("Help Center")} />
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogOut}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteAccount}
                >
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#dc2626',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginHorizontal: 60,
        marginTop: 20,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#dc2626',
        fontSize: 18,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#dc2626', // 深红色
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginHorizontal: 60,
        marginTop: 30, // 增大与logout按钮的距离
        marginBottom: 40, // 与屏幕底部的间距
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});

