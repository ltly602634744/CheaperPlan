import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useAuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';
import eventBus from '../utils/eventBus';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscriptionSuccess?: () => void;
}

export default function SubscriptionModal({ visible, onClose, onSubscriptionSuccess }: SubscriptionModalProps) {
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [yearlyPkg, setYearlyPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const selectedPlanRef = useRef<'monthly' | 'yearly'>('yearly');
  const [, forceUpdate] = useState({});
  const { session } = useAuthContext();

  const updateSelectedPlan = (plan: 'monthly' | 'yearly') => {
    selectedPlanRef.current = plan;
    forceUpdate({});
  };

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
        console.log('Product identifiers:', current.availablePackages.map(p => p.product.identifier));
      }
      const identifiers = {
        ios: {
          one_month_pass: 'one_month_pass_ios',
          one_year_pass: 'one_year_pass_ios'
        },
        android: {
          one_month_pass: 'one_month_pass_android',
          one_year_pass: 'one_year_pass_android'
        }
      };

      const platform = Platform.OS as 'ios' | 'android';
      const monthlyPackage = current?.availablePackages.find(p =>
        p.identifier === identifiers[platform]?.['one_month_pass']
      );
      const yearlyPackage = current?.availablePackages.find(p =>
        p.identifier === identifiers[platform]?.['one_year_pass']
      );

      console.log('Found monthly package:', monthlyPackage);
      console.log('Found yearly package:', yearlyPackage);
      
      // 详细价格调试信息
      if (monthlyPackage) {
        console.log('Monthly package details:');
        console.log('- Price:', monthlyPackage.product.price);
        console.log('- Price string:', monthlyPackage.product.priceString);
        console.log('- Currency code:', monthlyPackage.product.currencyCode);
        console.log('- Product identifier:', monthlyPackage.product.identifier);
      }
      
      if (yearlyPackage) {
        console.log('Yearly package details:');
        console.log('- Price:', yearlyPackage.product.price);
        console.log('- Price string:', yearlyPackage.product.priceString);
        console.log('- Currency code:', yearlyPackage.product.currencyCode);
        console.log('- Product identifier:', yearlyPackage.product.identifier);
      }

      setMonthlyPkg(monthlyPackage ?? null);
      setYearlyPkg(yearlyPackage ?? null);
    } catch (error) {
      console.error('Error getting offerings:', error);
    } finally {
      setLoading(false);
    }
  };


  const buy = async () => {
    const selectedPackage = selectedPlanRef.current === 'monthly' ? monthlyPkg : yearlyPkg;
    if (!selectedPackage || !session?.user?.id) return;

    setPurchasing(true);
    try {
      await Purchases.purchasePackage(selectedPackage);

      // Calculate expiration date based on subscription type
      const currentDate = new Date();
      const daysToAdd = selectedPlanRef.current === 'monthly' ? 30 : 365;
      const expirationDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

      const { error } = await updateUserProfile(session.user.id, {
        premium: 'paid',
        premium_expiration_date: expirationDate,
      });

      if (error) {
        console.error('Failed to update premium status:', error);
        Alert.alert('Warning', 'Purchase successful, but failed to update user status. Please contact customer support.');
      } else {
        Alert.alert('Success', 'Premium pass activated! You now have full access to all plan details.');
        // 触发会员状态更新事件
        const eventData = {
          premium: 'paid',
          premium_expiration_date: expirationDate,
          subscriptionType: selectedPlanRef.current
        };
        console.log('SubscriptionModal: Emitting subscriptionUpdated event:', eventData);
        eventBus.emit('subscriptionUpdated', eventData);
        onSubscriptionSuccess?.();
        onClose();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', `Purchase failed: ${e.message}`);
      }
    } finally {
      setPurchasing(false);
    }
  };

  // 清理价格字符串，移除地区前缀（如"US"）
  const cleanPriceString = (priceString: string) => {
    return priceString.replace(/^US\$/, '$').replace(/^US /, '');
  };

  const hasValidPackages = monthlyPkg || yearlyPkg;
  const currentPackage = selectedPlanRef.current === 'monthly' ? monthlyPkg : yearlyPkg;

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentPress = useCallback(() => {
    // Prevent backdrop close when touching content
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity 
          activeOpacity={1} 
          className="flex-1 justify-end" 
          onPress={handleBackdropPress}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContent} 
            onPress={handleContentPress}
          >
            <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-700">Get Premium Access</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 p-6">
                {loading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="mt-4 text-gray-500">Loading subscription options...</Text>
                  </View>
                ) : !hasValidPackages ? (
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-center text-gray-500">
                      Sorry there's an error on our side. Please contact customer service.
                    </Text>
                  </View>
                ) : (
                  <View className="flex-1">
                    <View className="flex-row mb-6 bg-gray-100 rounded-2xl p-1">
                      {monthlyPkg && (
                        <TouchableOpacity
                          onPress={() => updateSelectedPlan('monthly')}
                          style={[
                            styles.planOption,
                            selectedPlanRef.current === 'monthly' && styles.planOptionSelected
                          ]}
                        >
                          <Text style={[
                            styles.planOptionText,
                            selectedPlanRef.current === 'monthly' && styles.planOptionTextSelected
                          ]}>30 Days</Text>
                        </TouchableOpacity>
                      )}

                      {yearlyPkg && (
                        <TouchableOpacity
                          onPress={() => updateSelectedPlan('yearly')}
                          style={[
                            styles.planOption,
                            selectedPlanRef.current === 'yearly' && styles.planOptionSelected
                          ]}
                        >
                          <Text style={[
                            styles.planOptionText,
                            selectedPlanRef.current === 'yearly' && styles.planOptionTextSelected
                          ]}>365 Days</Text>
                          {yearlyPkg && monthlyPkg && (
                            <Text style={styles.bestValueText}>
                              Best Value
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Selected Package Info */}
                    {currentPackage && (
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageTitle}>Premium Pass</Text>
                        <Text style={styles.packagePrice}>
                          {cleanPriceString(currentPackage.product.priceString)}
                          <Text style={styles.packageDuration}>
                            {selectedPlanRef.current === 'monthly' ? ' for 30 days' : ' for 365 days'}
                          </Text>
                        </Text>

                        {/* Features */}
                        <View className="space-y-2">
                          <View className="flex-row items-center">
                            <View style={styles.featureIcon}>
                              <Text style={styles.featureIconText}>✓</Text>
                            </View>
                            <Text className="ml-3 text-gray-700 text-sm">Access all carrier information</Text>
                          </View>
                          <View className="flex-row items-center">
                            <View style={styles.featureIcon}>
                              <Text style={styles.featureIconText}>✓</Text>
                            </View>
                            <Text className="ml-3 text-gray-700 text-sm">Unlock all hidden plan details</Text>
                          </View>
                          <View className="flex-row items-center">
                            <View style={styles.featureIcon}>
                              <Text style={styles.featureIconText}>✓</Text>
                            </View>
                            <Text className="ml-3 text-gray-700 text-sm">Get priority customer support</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={buy}
                      disabled={purchasing || !currentPackage}
                      style={[
                        styles.buyButton,
                        (purchasing || !currentPackage) && styles.buyButtonDisabled
                      ]}
                    >
                      {purchasing ? (
                        <View style={styles.purchasingContainer}>
                          <ActivityIndicator size="small" color="white" />
                          <Text style={styles.purchasingText}>Processing...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buyButtonText}>Buy Pass</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
  },
  planOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planOptionSelected: {
    backgroundColor: 'white',
  },
  planOptionText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#6b7280',
  },
  planOptionTextSelected: {
    color: '#2563eb',
  },
  bestValueText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  packageInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 12,
  },
  packageDuration: {
    fontSize: 16,
    color: '#6b7280',
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#2563eb',
  },
  buyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  purchasingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchasingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});