import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useAuthContext } from '../context/AuthContext';
import { updateUserPremiumStatus } from '../services/userService';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscriptionSuccess?: () => void;
}

export default function PaywallModal({ visible, onClose, onSubscriptionSuccess }: PaywallModalProps) {
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { session } = useAuthContext();

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      const { current, all } = await Purchases.getOfferings();
      console.log('RevenueCat Offerings Debug:');
      console.log('Current offering:', current);
      console.log('All offerings:', all);
      
      if (current) {
        console.log('Available packages:', current.availablePackages);
        console.log('Package identifiers:', current.availablePackages.map(p => p.identifier));
      }
      
      // 通过包标识符查找
      const foundPackage = current?.availablePackages.find(p => p.identifier === '$rc_monthly');
      console.log('Found package:', foundPackage);
      
      setPkg(foundPackage ?? null);
    } catch (error) {
      console.error('Error getting offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const buy = async () => {
    if (!pkg || !session?.user?.id) return;
    
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      if (customerInfo.entitlements.active['Pro']) {
        // 付款成功，更新用户的 premium 状态
        const { error } = await updateUserPremiumStatus(session.user.id, 'paid');
        
        if (error) {
          console.error('Failed to update premium status:', error);
          Alert.alert('Warning', '订阅成功，但更新用户状态失败，请联系客服');
        } else {
          Alert.alert('Success', '订阅成功，Pro 已解锁！');
          onSubscriptionSuccess?.();
          onClose();
        }
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', `购买失败: ${e.message}`);
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl min-h-[60%] max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">Upgrade to Pro</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1 p-6">
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-4 text-gray-600">Loading subscription options...</Text>
              </View>
            ) : !pkg ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-center text-gray-600">
                  Sorry there's an error on our side. Please contact customer service.
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                {/* Package Info */}
                <View className="bg-blue-50 rounded-2xl p-6 mb-6">
                  <Text className="text-2xl font-bold text-center text-blue-600 mb-2">
                    {pkg.product.title}
                  </Text>
                  <Text className="text-4xl font-bold text-center text-blue-600 mb-4">
                    {pkg.product.priceString}
                    <Text className="text-lg text-gray-600">/Month</Text>
                  </Text>
                  
                  {/* Features */}
                  <View className="space-y-3">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text className="ml-3 text-gray-700">View carrier information</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text className="ml-3 text-gray-700">Unlock premium features</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text className="ml-3 text-gray-700">Get priority customer support</Text>
                    </View>
                  </View>
                </View>

                {/* Subscribe Button */}
                <TouchableOpacity
                  onPress={buy}
                  disabled={purchasing}
                  className={`py-4 rounded-2xl ${purchasing ? 'bg-gray-400' : 'bg-blue-600'}`}
                >
                  {purchasing ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">Processing...</Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      Subscribe Now
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Terms */}
                <Text className="text-center text-gray-500 text-xs mt-4 px-4">
                  The subscription will automatically renew monthly and can be canceled at any time. By subscribing, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
} 