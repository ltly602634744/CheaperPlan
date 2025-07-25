import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { useFocusEffect } from '@react-navigation/native';
import { UserProfile } from '../types/database';

export default function SubscriptionScreen() {
    const router = useRouter();
    const { session } = useAuthContext();
    const [canceling, setCanceling] = useState(false);
    const [userProfile, setUserProfile] = useState<Partial<UserProfile> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取用户会员信息
    const fetchSubscriptionInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!session?.user?.id) {
                setError('User not authenticated');
                return;
            }
            const { data, error: profileError } = await getUserProfile(session.user.id);
            if (profileError) {
                setError('Failed to load subscription information');
            } else {
                setUserProfile(data);
            }
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
        if (!userProfile || !userProfile.premium_expiration_date) return 'free';
        const expirationDate = new Date(userProfile.premium_expiration_date);
        const currentDate = new Date();
        if (expirationDate > currentDate) return 'active';
        return 'expired';
    };

    // 格式化到期日期
    const formatExpirationDate = (date: Date | null) => {
        if (!date) return 'Not set';
        return date.toLocaleDateString();
    };

    // 获取订阅状态显示文本
    const getSubscriptionStatus = () => {
        if (loading) return 'Loading...';
        
        const status = getMembershipStatus();
        switch (status) {
            case 'active':
                return 'Active';
            case 'expired':
                return 'Expired';
            default:
                return 'Free';
        }
    };

    // 获取订阅状态的颜色
    const getStatusColor = () => {
        const status = getSubscriptionStatus();
        switch (status) {
            case 'Active':
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
        const status = getMembershipStatus();
        return status === 'active' ? 'Premium' : 'Free';
    };

    // 获取到期日期
    const getExpirationDate = () => {
        if (userProfile && userProfile.premium_expiration_date) {
            return new Date(userProfile.premium_expiration_date);
        }
        return null;
    };

    // Non-renewing subscription，不需要自动续费检查
    const isAutoRenewing = () => {
        return false;
    };

    // 取消订阅（取消自动续费）
    const handleCancelSubscription = async () => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure you want to cancel your subscription? You will continue to have access until the current billing period ends.',
            [
                {
                    text: 'Keep Subscription',
                    style: 'cancel'
                },
                {
                    text: 'Cancel Subscription',
                    style: 'destructive',
                    onPress: async () => {
                        setCanceling(true);
                        try {
                            // 刷新用户信息
                            await fetchSubscriptionInfo();
                            const status = getMembershipStatus();
                            
                            if (status === 'active') {
                                // Non-renewing subscription，引导用户联系客服
                                Alert.alert(
                                    'Contact Support',
                                    'Your current subscription is non-renewing and will expire automatically. If you need assistance, please contact our customer support.',
                                    [{ text: 'OK' }]
                                );
                            } else {
                                Alert.alert('No Active Subscription', 'You don\'t have any active subscriptions.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to process request. Please try again.');
                        } finally {
                            setCanceling(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-6">
                <Text className="text-2xl font-bold text-center mb-8">My Subscription</Text>
                
                {/* 订阅状态卡片 */}
                <View className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">Subscription Details</Text>
                    
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-600">Status:</Text>
                        <Text className={`font-semibold ${getStatusColor()}`}>
                            {getSubscriptionStatus()}
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
                                <Text className="text-gray-600">Expiration Date:</Text>
                                <Text className="font-semibold text-gray-800">
                                    {loading ? '...' : formatExpirationDate(getExpirationDate())}
                                </Text>
                            </View>
                            
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-600">Auto-Renew:</Text>
                                <Text className="font-semibold text-red-600">
                                    {loading ? '...' : 'Disabled (Non-renewing)'}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* 功能列表 */}
                <View className="bg-white rounded-xl shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-800 px-6 pt-6 pb-4">Premium Features</Text>
                    
                    <View className="px-6 pb-6">
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Unlimited plan creation</Text>
                        </View>
                        
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Advanced AI features</Text>
                        </View>
                        
                        <View className="flex-row items-center mb-3">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Priority customer support</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            <Text className="text-green-500 mr-3">✓</Text>
                            <Text className="text-gray-600 flex-1">Export plans to multiple formats</Text>
                        </View>
                    </View>
                </View>

                {/* 操作按钮 */}
                {getMembershipStatus() === 'active' && (
                    <TouchableOpacity
                        className="bg-red-500 rounded-xl py-4 items-center shadow-sm"
                        onPress={handleCancelSubscription}
                        disabled={canceling}
                    >
                        {canceling ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white text-lg font-semibold ml-2">Processing...</Text>
                            </View>
                        ) : (
                            <Text className="text-white text-lg font-semibold">Cancel Subscription</Text>
                        )}
                    </TouchableOpacity>
                )}

                {getMembershipStatus() === 'free' && (
                    <TouchableOpacity
                        className="bg-blue-500 rounded-xl py-4 items-center shadow-sm"
                        onPress={() => {
                            Alert.alert('Upgrade', 'Navigate to subscription purchase');
                        }}
                    >
                        <Text className="text-white text-lg font-semibold">Upgrade to Premium</Text>
                    </TouchableOpacity>
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
        </SafeAreaView>
    );
}