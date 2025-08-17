import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
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
  const insets = useSafeAreaInsets();

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
      // 使用RevenueCat标准package identifiers
      const monthlyPackage = current?.availablePackages.find(p =>
        p.identifier === '$rc_monthly'
      );
      const yearlyPackage = current?.availablePackages.find(p =>
        p.identifier === '$rc_annual'
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

      // Get real subscription info from RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();

      // Find the correct entitlement based on purchased package
      let entitlement = null;
      if (selectedPlanRef.current === 'monthly') {
        entitlement = customerInfo.entitlements.active["one_month_access"];
      } else {
        entitlement = customerInfo.entitlements.active["one_year_access"];
      }

      // Fallback: try to find any active entitlement
      if (!entitlement) {
        const activeEntitlements = Object.values(customerInfo.entitlements.active);
        entitlement = activeEntitlements.length > 0 ? activeEntitlements[0] : null;
      }

      let expirationDate: Date;
      let autoRenewEnabled = true;

      if (entitlement && entitlement.expirationDate) {
        // Use real expiration date from RevenueCat
        expirationDate = new Date(entitlement.expirationDate);
        autoRenewEnabled = entitlement.willRenew;
        console.log('SubscriptionModal: Using RevenueCat data:', {
          expirationDate,
          autoRenewEnabled,
          entitlementId: entitlement.identifier
        });
      } else {
        // Fallback to calculated date if RevenueCat data not available
        console.warn('SubscriptionModal: No entitlement found, using fallback calculation');
        const currentDate = new Date();
        const daysToAdd = selectedPlanRef.current === 'monthly' ? 30 : 365;
        expirationDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        autoRenewEnabled = true; // Default for auto-renewing subscriptions
      }

      const { error } = await updateUserProfile(session.user.id, {
        premium: selectedPlanRef.current, // 'monthly' or 'yearly'
        premium_expiration_date: expirationDate,
        auto_renew_enabled: autoRenewEnabled,
      });

      if (error) {
        console.error('Failed to update premium status:', error);
        Alert.alert('Warning', 'Purchase successful, but failed to update user status. Please contact customer support.');
      } else {
        Alert.alert('Success', 'Premium pass activated! You now have full access to all plan details.');
        // 触发会员状态更新事件
        const eventData = {
          premium: selectedPlanRef.current, // 'monthly' or 'yearly'
          premium_expiration_date: expirationDate,
          auto_renew_enabled: autoRenewEnabled,
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
      <View style={[styles.backdrop]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdropTouchable}
          onPress={handleBackdropPress}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 20) }
            ]}
            onPress={handleContentPress}
          >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Get Premium Access</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.accent.blue} />
                    <Text style={styles.loadingText}>Loading subscription options...</Text>
                  </View>
                ) : !hasValidPackages ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      Sorry there&apos;s an error on our side. Please contact customer service.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.contentBody}>
                    <View style={styles.planSwitcher}>
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
                          ]}>Monthly</Text>
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
                          ]}>Yearly</Text>
                          {yearlyPkg && monthlyPkg && (
                            <Text style={styles.bestValueText}>
                              Save more than 16%
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Selected Package Info */}
                    {currentPackage && (
                      <View style={styles.packageInfo}>
                        <Text style={styles.packagePrice}>
                          {cleanPriceString(currentPackage.product.priceString)}
                          <Text style={styles.packageDuration}>
                            {selectedPlanRef.current === 'monthly' ? ' per month' : ' per year'}
                          </Text>
                        </Text>

                        {/* Description */}
                        <View>
                          <Text style={styles.primaryDescription}>
                            Get Premium now to unlock all recommended plans.
                          </Text>
                          <Text style={styles.secondaryDescription}>
                            We know you won&apos;t change your mobile plan often. You can cancel anytime and still receive notifications when we find a cheaper plan for you.
                          </Text>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 16,
  },
  contentBody: {
    flex: 1,
  },
  planSwitcher: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 16,
    padding: 4,
  },
  planOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planOptionSelected: {
    backgroundColor: Colors.background.card,
    shadowColor: Colors.border.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  planOptionText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: Colors.text.secondary,
  },
  planOptionTextSelected: {
    color: Colors.accent.blue,
  },
  bestValueText: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.functional.success,
    fontWeight: '500',
    marginTop: 2,
  },
  packageInfo: {
    backgroundColor: Colors.status.infoBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.accent.blue,
    marginBottom: 12,
    marginTop: 6,
  },
  packageDuration: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  primaryDescription: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  secondaryDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.button.primaryBg,
  },
  buyButtonDisabled: {
    backgroundColor: Colors.button.disabledBg,
  },
  buyButtonText: {
    color: Colors.button.primaryText,
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
    color: Colors.button.primaryText,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});