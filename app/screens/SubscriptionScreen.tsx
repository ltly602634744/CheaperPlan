import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubscriptionModal from '../components/SubscriptionModal';
import { useAuthContext } from '../context/AuthContext';
import { getMembershipStatusDisplay, getSubscriptionStatus, SubscriptionInfo } from '../services/subscriptionService';

export default function SubscriptionScreen() {
    const { session } = useAuthContext();
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    // 获取用户会员信息
    const fetchSubscriptionInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!session?.user?.id) {
                setError('User not authenticated');
                return;
            }
            
            const subscriptionData = await getSubscriptionStatus(session.user.id);
            setSubscriptionInfo(subscriptionData);
        } catch (err) {
            console.error('Error fetching subscription info:', err);
            setError('Failed to load subscription information');
        } finally {
            setLoading(false);
        }
    };

    // 页面聚焦时刷新数据
    useFocusEffect(
        React.useCallback(() => {
            fetchSubscriptionInfo();
        }, [])
    );

    // 获取会员状态
    const getMembershipStatus = () => {
        if (!subscriptionInfo) return 'free';
        return subscriptionInfo.status;
    };

    // 格式化到期日期
    const formatExpirationDate = (date: Date | null) => {
        if (!date) return 'Not set';
        return date.toLocaleDateString();
    };

    // 获取订阅状态显示文本
    const getSubscriptionStatusDisplay = () => {
        if (loading) return 'Loading...';
        if (!subscriptionInfo) return 'Free';
        
        return getMembershipStatusDisplay(subscriptionInfo);
    };

    // 获取订阅状态的颜色
    const getStatusColor = () => {
        const status = getSubscriptionStatusDisplay();
        switch (status) {
            case 'Premium':
                return 'text-green-600';
            case 'Expired':
                return 'text-red-600';
            case 'Free':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    // 获取订阅类型
    const getSubscriptionType = () => {
        if (!subscriptionInfo) return 'Free';
        return (subscriptionInfo.status === 'active_monthly' || subscriptionInfo.status === 'active_yearly') ? 'Premium' : 'Free';
    };

    // 获取到期日期
    const getExpirationDate = () => {
        return subscriptionInfo?.expirationDate || null;
    };

    // 获取自动续费状态
    const isAutoRenewing = () => {
        return subscriptionInfo?.autoRenewEnabled || false;
    };

    // 检查是否有活跃的订阅
    const hasActiveSubscription = () => {
        const status = getMembershipStatus();
        return status === 'active_monthly' || status === 'active_yearly';
    };


    // 处理取消订阅
    const handleCancelSubscription = () => {
        Alert.alert(
            'Cancel Subscription',
            'To cancel your subscription, you\'ll need to go to your device\'s subscription settings. Your premium access will continue until the end of your current billing period.',
            [
                {
                    text: 'Not Now',
                    style: 'cancel'
                },
                {
                    text: 'Open Subscription Settings',
                    style: 'destructive',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('https://apps.apple.com/account/subscriptions');
                        } else {
                            Linking.openURL('https://play.google.com/store/account/subscriptions');
                        }
                    }
                }
            ]
        );
    };


    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <ScrollView className="flex-1 px-4 pt-6">
                {/* 订阅状态卡片 */}
                <View className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Subscription Details</Text>
                    
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-600">Status:</Text>
                        <Text className={`font-semibold ${getStatusColor()}`}>
                            {getSubscriptionStatusDisplay()}
                        </Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-600">Plan Type:</Text>
                        <Text className="font-semibold text-gray-800">
                            {loading ? '...' : getSubscriptionType()}
                        </Text>
                    </View>
                    
                    {getMembershipStatus() !== 'free' && getExpirationDate() && (
                        <>
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-gray-600">
                                    {isAutoRenewing() ? 'Next Renewal:' : 'Expires On:'}
                                </Text>
                                <Text className="font-semibold text-gray-800">
                                    {loading ? '...' : formatExpirationDate(getExpirationDate())}
                                </Text>
                            </View>
                            
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-gray-600">Auto-Renewal:</Text>
                                <Text className={`font-semibold ${isAutoRenewing() ? 'text-green-600' : 'text-orange-600'}`}>
                                    {loading ? '...' : (isAutoRenewing() ? 'On' : 'Off')}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* 功能列表 */}
                <View className="bg-white rounded-xl shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-800 px-6 pt-6 pb-4">
                        {hasActiveSubscription() ? 'Premium Features' : 'Get Premium to Unlock'}
                    </Text>
                    
                    <View className="px-6 pb-6">
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Unlimited plan searches</Text>
                        </View>
                        
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Find perfect matches with smart filters</Text>
                        </View>
                        
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Be the first to know when better plans drop</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Flexible subscription management with full control</Text>
                        </View>
                    </View>
                </View>


                {!loading && getMembershipStatus() === 'free' && (
                    <TouchableOpacity
                        className="bg-blue-500 rounded-xl py-4 items-center shadow-sm"
                        onPress={() => setShowSubscriptionModal(true)}
                    >
                        <Text className="text-white text-lg font-semibold">Upgrade to Premium</Text>
                    </TouchableOpacity>
                )}

                {!loading && getMembershipStatus() === 'expired' && (
                    <TouchableOpacity
                        className="bg-blue-500 rounded-xl py-4 items-center shadow-sm"
                        onPress={() => setShowSubscriptionModal(true)}
                    >
                        <Text className="text-white text-lg font-semibold">Renew Premium</Text>
                    </TouchableOpacity>
                )}

                {/* 活跃订阅且自动续费开启 - 显示取消订阅选项 */}
                {!loading && hasActiveSubscription() && isAutoRenewing() && (
                    <TouchableOpacity
                        className="bg-red-50 border border-red-200 rounded-xl py-3 items-center mt-4"
                        onPress={handleCancelSubscription}
                    >
                        <Text className="text-red-600 font-semibold">Cancel Subscription</Text>
                    </TouchableOpacity>
                )}

                {/* 已取消但仍有效的订阅 - 显示到期信息 */}
                {!loading && hasActiveSubscription() && !isAutoRenewing() && (
                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                        <Text className="text-orange-800 text-center mb-3">
                            Your subscription will expire on {formatExpirationDate(getExpirationDate())}
                        </Text>
                        <Text className="text-orange-600 text-sm text-center">
                            To reactivate auto-renewal, go to your device's subscription settings.
                        </Text>
                    </View>
                )}

                {/* 错误显示 */}
                {error && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                        <Text className="text-red-700 text-center">{error}</Text>
                        <TouchableOpacity
                            className="mt-2"
                            onPress={fetchSubscriptionInfo}
                        >
                            <Text className="text-red-600 text-center font-semibold">Tap to retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* SubscriptionModal */}
            {showSubscriptionModal && (
                <SubscriptionModal
                    visible={showSubscriptionModal}
                    onClose={() => setShowSubscriptionModal(false)}
                    onSubscriptionSuccess={() => {
                        setShowSubscriptionModal(false);
                        // 刷新用户信息以更新订阅状态
                        fetchSubscriptionInfo();
                    }}
                />
            )}
        </SafeAreaView>
    );
}