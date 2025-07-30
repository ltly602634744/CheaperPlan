import Purchases from 'react-native-purchases';
import { getUserProfile, updateUserProfile } from './userService';

export type SubscriptionStatus = 'active_monthly' | 'active_yearly' | 'expired' | 'free';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  expirationDate: Date | null;
  autoRenewEnabled: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
}

/**
 * 获取订阅状态，优先使用RevenueCat实时数据，本地数据作为缓存
 */
export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionInfo> => {
  try {
    // 首先尝试从RevenueCat获取实时数据
    const customerInfo = await Purchases.getCustomerInfo();
    
    // 检查活跃的entitlements
    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    
    if (activeEntitlements.length > 0) {
      const entitlement = activeEntitlements[0];
      const expirationDate = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
      const autoRenewEnabled = entitlement.willRenew;
      
      // 确定订阅类型
      let subscriptionType: 'monthly' | 'yearly' | null = null;
      if (entitlement.identifier === 'one_month_access') {
        subscriptionType = 'monthly';
      } else if (entitlement.identifier === 'one_year_access') {
        subscriptionType = 'yearly';
      }
      
      // 确定订阅类型并更新本地缓存
      const premiumType = subscriptionType || (expirationDate && expirationDate > new Date() ? 'active' : 'unknown');
      
      await updateUserProfile(userId, {
        premium: subscriptionType || 'active', // 使用具体的订阅类型，如果无法确定则使用'active'
        premium_expiration_date: expirationDate,
        auto_renew_enabled: autoRenewEnabled,
      });
      
      // 根据订阅类型确定状态
      let status: SubscriptionStatus;
      if (subscriptionType === 'monthly') {
        status = 'active_monthly';
      } else if (subscriptionType === 'yearly') {
        status = 'active_yearly';
      } else {
        // 如果无法确定类型，但确实是活跃的，默认为monthly
        status = 'active_monthly';
      }

      console.log('SubscriptionService: Using RevenueCat data:', {
        status,
        expirationDate,
        autoRenewEnabled,
        subscriptionType
      });
      
      return {
        status,
        expirationDate,
        autoRenewEnabled,
        subscriptionType
      };
    }
    
    // 检查非活跃的entitlements（可能过期或取消）
    const allEntitlements = Object.values(customerInfo.entitlements.all);
    if (allEntitlements.length > 0) {
      const latestEntitlement = allEntitlements
        .sort((a, b) => {
          const dateA = a.latestPurchaseDate ? new Date(a.latestPurchaseDate).getTime() : 0;
          const dateB = b.latestPurchaseDate ? new Date(b.latestPurchaseDate).getTime() : 0;
          return dateB - dateA;
        })[0];
      
      const expirationDate = latestEntitlement.expirationDate ? new Date(latestEntitlement.expirationDate) : null;
      const autoRenewEnabled = latestEntitlement.willRenew;
      
      // 根据过期时间判断状态
      let status: SubscriptionStatus = 'expired';
      if (expirationDate && expirationDate > new Date()) {
        // 如果仍未过期，需要确定是月订阅还是年订阅
        if (latestEntitlement.identifier === 'one_month_access') {
          status = 'active_monthly';
        } else if (latestEntitlement.identifier === 'one_year_access') {
          status = 'active_yearly';
        } else {
          // fallback到monthly
          status = 'active_monthly';
        }
      }
      
      return {
        status,
        expirationDate,
        autoRenewEnabled,
        subscriptionType: null
      };
    }
    
    // 没有任何entitlements，用户是免费用户
    return {
      status: 'free',
      expirationDate: null,
      autoRenewEnabled: false,
      subscriptionType: null
    };
    
  } catch (error) {
    console.warn('SubscriptionService: RevenueCat error, falling back to local data:', error);
    
    // RevenueCat不可用时，使用本地缓存数据
    return getLocalSubscriptionStatus(userId);
  }
};

/**
 * 从本地数据库获取订阅状态（fallback机制）
 */
const getLocalSubscriptionStatus = async (userId: string): Promise<SubscriptionInfo> => {
  try {
    const { data: profile } = await getUserProfile(userId, "premium,premium_expiration_date,auto_renew_enabled");
    
    if (!profile || !profile.premium_expiration_date || !profile.premium || profile.premium === 'free') {
      return {
        status: 'free',
        expirationDate: null,
        autoRenewEnabled: false,
        subscriptionType: null
      };
    }
    
    const expirationDate = new Date(profile.premium_expiration_date);
    const autoRenewEnabled = profile.auto_renew_enabled ?? false;
    const currentTime = new Date();
    
    // 根据过期时间和premium字段确定状态
    let status: SubscriptionStatus;
    if (expirationDate > currentTime) {
      // 未过期，根据premium类型确定状态
      if (profile.premium === 'monthly') {
        status = 'active_monthly';
      } else if (profile.premium === 'yearly') {
        status = 'active_yearly';
      } else {
        // 兼容旧数据，默认为monthly
        status = 'active_monthly';
      }
    } else {
      status = 'expired';
    }
    
    // 从premium字段推断订阅类型
    let subscriptionType: 'monthly' | 'yearly' | null = null;
    if (profile.premium === 'monthly') {
      subscriptionType = 'monthly';
    } else if (profile.premium === 'yearly') {
      subscriptionType = 'yearly';
    }

    return {
      status,
      expirationDate,
      autoRenewEnabled,
      subscriptionType
    };
    
  } catch (error) {
    console.error('SubscriptionService: Failed to get local subscription status:', error);
    return {
      status: 'free',
      expirationDate: null,
      autoRenewEnabled: false,
      subscriptionType: null
    };
  }
};

/**
 * 检查用户是否有有效的高级会员权限
 */
export const hasActivePremium = async (userId: string): Promise<boolean> => {
  const subscriptionInfo = await getSubscriptionStatus(userId);
  return subscriptionInfo.status === 'active_monthly' || subscriptionInfo.status === 'active_yearly';
};

/**
 * 获取简化的会员状态字符串（用于UI显示）
 */
export const getMembershipStatusDisplay = (subscriptionInfo: SubscriptionInfo): string => {
  switch (subscriptionInfo.status) {
    case 'active_monthly':
      return 'Premium';
    case 'active_yearly':
      return 'Premium';
    case 'expired':
      return 'Expired';
    case 'free':
    default:
      return 'Free';
  }
};