import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useAuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

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

  const hasValidPackages = monthlyPkg || yearlyPkg;
  const currentPackage = selectedPlanRef.current === 'monthly' ? monthlyPkg : yearlyPkg;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: '60%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#374151' }}>Get Premium Access</Text>
                <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, padding: 24 }}>
                {loading ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading subscription options...</Text>
                  </View>
                ) : !hasValidPackages ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', color: '#6b7280' }}>
                      Sorry there's an error on our side. Please contact customer service.
                    </Text>
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: '#f3f4f6', borderRadius: 16, padding: 4 }}>
                      {monthlyPkg && (
                        <TouchableOpacity
                          onPress={() => updateSelectedPlan('monthly')}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: selectedPlanRef.current === 'monthly' ? 'white' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: 16,
                            color: selectedPlanRef.current === 'monthly' ? '#2563eb' : '#6b7280'
                          }}>30 Days</Text>
                        </TouchableOpacity>
                      )}

                      {yearlyPkg && (
                        <TouchableOpacity
                          onPress={() => updateSelectedPlan('yearly')}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: selectedPlanRef.current === 'yearly' ? 'white' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: 16,
                            color: selectedPlanRef.current === 'yearly' ? '#2563eb' : '#6b7280'
                          }}>365 Days</Text>
                          {yearlyPkg && monthlyPkg && (
                            <Text style={{ textAlign: 'center', fontSize: 10, color: '#10b981', fontWeight: '500', marginTop: 2 }}>
                              Best Value
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Selected Package Info */}
                    {currentPackage && (
                      <View style={{ backgroundColor: '#eff6ff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#2563eb', marginBottom: 6 }}>
                          Premium Pass
                        </Text>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2563eb', marginBottom: 12 }}>
                          {currentPackage.product.priceString}
                          <Text style={{ fontSize: 16, color: '#6b7280' }}>
                            {selectedPlanRef.current === 'monthly' ? ' for 30 days' : ' for 365 days'}
                          </Text>
                        </Text>

                        {/* Features */}
                        <View style={{ gap: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                            </View>
                            <Text style={{ marginLeft: 12, color: '#374151', fontSize: 14 }}>Access all carrier information</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                            </View>
                            <Text style={{ marginLeft: 12, color: '#374151', fontSize: 14 }}>Unlock all hidden plan details</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                            </View>
                            <Text style={{ marginLeft: 12, color: '#374151', fontSize: 14 }}>Get priority customer support</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={buy}
                      disabled={purchasing || !currentPackage}
                      style={{
                        paddingVertical: 16,
                        borderRadius: 16,
                        backgroundColor: purchasing || !currentPackage ? '#9ca3af' : '#2563eb'
                      }}
                    >
                      {purchasing ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                          <ActivityIndicator size="small" color="white" />
                          <Text style={{ color: 'white', marginLeft: 8, fontSize: 16, fontWeight: '600' }}>Processing...</Text>
                        </View>
                      ) : (
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                          Buy Pass
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}