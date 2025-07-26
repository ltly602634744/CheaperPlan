import Cell from "@/app/components/SettingCell";
import { useAuthContext } from "@/app/context/AuthContext";
import { ModalContentKey } from "@/app/data";
import { useAuth } from "@/app/hooks/useAuth";
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
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Purchases from 'react-native-purchases';
import { updateUserProfile } from '../services/userService';
import eventBus from '../utils/eventBus';

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { session } = useAuthContext();
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

    const handleRestore = async () => {
        if (!session?.user?.id) return;
        try {
            const customerInfo = await Purchases.restorePurchases();
            const entitlement = customerInfo.entitlements.active["Pro"];

            if (entitlement) {
                const expiration = entitlement.expirationDate;
                const expirationDate = expiration ? new Date(expiration) : null;
                // ✅ 调用后端接口更新数据库状态
                await updateUserProfile(session.user.id, {
                    premium: 'paid',
                    premium_expiration_date: expirationDate,
                });

                // 触发会员状态更新事件
                eventBus.emit('subscriptionUpdated', {
                    premium: 'paid',
                    premium_expiration_date: expirationDate,
                    subscriptionType: 'restored'
                });

                Alert.alert('✅ Restoration successful', 'Your subscription has been restored');
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

    // 获取会员状态 (与SubscriptionScreen保持一致)
    const getMembershipStatus = () => {
        if (!user || !user.premium_expiration_date) return 'Free';
        const expirationDate = new Date(user.premium_expiration_date);
        const currentDate = new Date();
        if (expirationDate > currentDate) return 'Premium';
        return 'Expired';
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
                    className="mx-4 mt-5 rounded-lg bg-red-500 py-3 items-center"
                    onPress={handleLogOut}
                >
                    <Text className="text-white text-base font-semibold">Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}