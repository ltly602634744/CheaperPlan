import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { getSubscriptionStatus, getMembershipStatusDisplay, hasActivePremium, SubscriptionInfo } from '../services/subscriptionService';
import eventBus from '../utils/eventBus';

/**
 * 统一的订阅状态管理hook
 * 提供订阅信息获取、状态检查和自动刷新功能
 */
export const useSubscription = () => {
  const { session } = useAuthContext();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取订阅状态
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setSubscriptionInfo({
        status: 'free',
        expirationDate: null,
        autoRenewEnabled: false,
        subscriptionType: null
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const info = await getSubscriptionStatus(session.user.id);
      setSubscriptionInfo(info);
    } catch (err) {
      console.error('useSubscription: Error fetching subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
      
      // 设置默认状态作为fallback
      setSubscriptionInfo({
        status: 'free',
        expirationDate: null,
        autoRenewEnabled: false,
        subscriptionType: null
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // 检查是否有活跃的高级会员权限
  const checkPremiumAccess = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) return false;
    
    try {
      return await hasActivePremium(session.user.id);
    } catch (err) {
      console.error('useSubscription: Error checking premium access:', err);
      return false;
    }
  }, [session?.user?.id]);

  // 获取显示用的会员状态文本
  const getStatusDisplay = useCallback((): string => {
    if (loading) return 'Loading...';
    if (!subscriptionInfo) return 'Free';
    
    return getMembershipStatusDisplay(subscriptionInfo);
  }, [subscriptionInfo, loading]);

  // 检查特定状态
  const isActive = subscriptionInfo?.status === 'active_monthly' || subscriptionInfo?.status === 'active_yearly';
  const isActiveMonthly = subscriptionInfo?.status === 'active_monthly';
  const isActiveYearly = subscriptionInfo?.status === 'active_yearly';
  const isFree = subscriptionInfo?.status === 'free';
  const isExpired = subscriptionInfo?.status === 'expired';
  const hasAutoRenew = subscriptionInfo?.autoRenewEnabled || false;

  // 监听AppState变化，当App从后台回到前台时检查订阅状态
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('useSubscription: App became active, checking subscription status...');
        fetchSubscriptionStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [fetchSubscriptionStatus]);

  // 监听订阅状态更新事件
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      console.log('useSubscription: Received subscription update event, refreshing...');
      fetchSubscriptionStatus();
    };

    eventBus.on('subscriptionUpdated', handleSubscriptionUpdate);

    return () => {
      eventBus.off('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [fetchSubscriptionStatus]);

  // 初始加载和会话变化时刷新
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    // 数据
    subscriptionInfo,
    loading,
    error,
    
    // 状态检查
    isActive,
    isActiveMonthly,
    isActiveYearly,
    isFree,
    isExpired,
    hasAutoRenew,
    
    // 方法
    fetchSubscriptionStatus,
    checkPremiumAccess,
    getStatusDisplay,
    
    // 便捷访问
    expirationDate: subscriptionInfo?.expirationDate,
    subscriptionType: subscriptionInfo?.subscriptionType,
  };
};

export default useSubscription;