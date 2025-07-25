import InfoModal from "@/app/components/InfoModal";
import Cell from "@/app/components/SettingCell";
import { useAuthContext } from "@/app/context/AuthContext";
import { ModalContentKey, modalContents } from "@/app/data";
import { useAuth } from "@/app/hooks/useAuth";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import eventBus from "@/app/utils/eventBus";
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
import { updateUserProfile } from '../services/userService';

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { session } = useAuthContext();
    const { user, loading: profileLoading, refetch } = useUserProfile();
    const [notificationEnabled, setNotificationEnabled] = useState<string>("...");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");

    // 显示modal的函数
    const showModal = (title: ModalContentKey) => {
        setModalTitle(title);
        setModalContent(modalContents[title]);
        setModalVisible(true);
    };

    // 关闭modal的函数
    const closeModal = () => {
        setModalVisible(false);
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


    const handleLogOut = async () => {
        const { error } = await signOut();
        if (error) {
            Alert.alert('Error', `：${error.message}`);
        } else {
            Alert.alert('Succeed', 'Logged out successfully!');
            router.replace("/screens/AuthScreen");
        }
    }

    // 获取phone显示值
    const getPhoneDisplay = () => {
        const phone = session?.user?.phone;
        return phone || 'Not set';
    };
    const handleRestore = async () => {
        if (!session?.user?.id) return;
        try {
            const customerInfo = await Purchases.restorePurchases();
            const entitlement = customerInfo.entitlements.active["Pro"];

            if (entitlement) {
                const expiration = entitlement.expirationDate;
                // ✅ 调用后端接口更新数据库状态
                await updateUserProfile(session.user.id, {
                    premium: 'paid',
                    premium_expiration_date: expiration ? new Date(expiration) : null,
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* 第一组：基本信息 */}
                <View className="mt-2 bg-white shadow-sm overflow-hidden">
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Email" value={session?.user?.email || 'Not set'} onPress={() => router.push('../screens/EmailSettingScreen')} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Phone" value={getPhoneDisplay()} onPress={() => router.push('../screens/PhoneSettingScreen')} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Password" value="********" onPress={() => router.push('../screens/PasswordSettingScreen')} />
                </View>

                {/* 第二组：账户信息 */}
                <View className="mt-3 bg-white shadow-sm overflow-hidden">
                    <Cell label="Notification" value={notificationEnabled} onPress={() => router.push('../screens/NotificationSettingScreen')} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="My subscription" 
                        value={profileLoading ? '...' : (user?.premium === 'paid' ? 'Premium' : 'Free')}
                        onPress={() => router.push('../screens/SubscriptionScreen')}
                    />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    {/* <Cell label="Language" value="English" onPress={() => router.push('../screens/LanguageSettingScreen')} /> */}
                    <Cell label="Restore Purchase" value="" onPress={handleRestore} />
                </View>

                {/* 第三组：展示内容 */}
                <View className="mt-3 bg-white shadow-sm overflow-hidden">
                    <Cell label="Terms of Use" onPress={() => showModal("Terms of Use")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Privacy Policy" onPress={() => showModal("Privacy Policy")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="About" onPress={() => showModal("About")} />
                    <View className="h-[0.5px] bg-gray-100 mx-4" />
                    <Cell label="Help Center" onPress={() => showModal("Help Center")} />
                </View>

                <TouchableOpacity
                    className="mx-4 mt-5 rounded-lg bg-red-500 py-3 items-center"
                    onPress={handleLogOut}
                >
                    <Text className="text-white text-base font-semibold">Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* InfoModal */}
            <InfoModal
                visible={modalVisible}
                onClose={closeModal}
                title={modalTitle}
                content={modalContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});