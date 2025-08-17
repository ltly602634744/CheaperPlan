import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetModal from "../components/BottomSheetModal";
import SubscriptionModal from "../components/SubscriptionModal";
import { Colors } from "../constants/Colors";
import { useAuthContext } from "../context/AuthContext";
import { getProviderUrl, hasProviderUrl } from "../data";
import { useUserProfile } from "../hooks/useUserProfile";
import { hasActivePremium } from "../services/subscriptionService";
import eventBus from '../utils/eventBus';


// 排序选项
const SORT_OPTIONS = [
  { key: 'price-asc', label: 'Price: Low to High', shortLabel: 'Price ↑', icon: 'trending-up' },
  { key: 'price-desc', label: 'Price: High to Low', shortLabel: 'Price ↓', icon: 'trending-down' },
  { key: 'data-asc', label: 'Data: Low to High', shortLabel: 'Data ↑', icon: 'cellular' },
  { key: 'data-desc', label: 'Data: High to Low', shortLabel: 'Data ↓', icon: 'cellular' },
];

// 筛选选项
const FILTER_OPTIONS = [
  { key: 'coverage', label: 'Coverage', icon: 'globe' },
  { key: 'voicemail', label: 'With Voicemail', icon: 'mail' },
  { key: 'call-display', label: 'With Call Display', icon: 'call' },
  { key: 'call-waiting', label: 'With Call Waiting', icon: 'call-outline' },
  { key: 'suspicious-detection', label: 'With Suspicious Call Detection', icon: 'shield-checkmark' },
  { key: 'hotspot', label: 'With Hotspot', icon: 'wifi' },
  { key: 'conference-call', label: 'With Conference Call', icon: 'people' },
  { key: 'video-call', label: 'With Video Call', icon: 'videocam' },
];

const BetterPlanScreen: React.FC = () => {
  const { betterPlans, refetch: refetchRecommendPlans } = useRecommendPlans();
  const { user, loading: profileLoading, refetch } = useUserProfile();
  const { session } = useAuthContext();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 排序和筛选状态
  const [selectedSort, setSelectedSort] = useState('price-asc');
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCoverageExpanded, setIsCoverageExpanded] = useState(false);

  // 检查用户 premium 状态的函数
  const checkPremiumStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      const hasActiveSub = await hasActivePremium(session.user.id);
      setIsPremium(hasActiveSub);
    } catch (err) {
      console.error('Error checking premium status:', err);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);


  // 使用 useFocusEffect 替代 useEffect，每次页面获得焦点时都会执行
  useFocusEffect(
    useCallback(() => {
      checkPremiumStatus();
      // refetch();
      refetchRecommendPlans(); // 确保推荐套餐也会刷新
      console.log('Focus effect triggered');
    }, [])
  );

  // 监听用户套餐更新事件
  useFocusEffect(
    useCallback(() => {
      const handlePlanUpdate = () => {
        console.log('Plan updated, refreshing better plans');
        refetchRecommendPlans();
      };

      eventBus.on('userPlanUpdated', handlePlanUpdate);
      return () => {
        eventBus.off('userPlanUpdated', handlePlanUpdate);
      };
    }, [])
  );


  // 获取所有可用国家
  const availableCountries = useMemo(() => {
    const countryMap = new Map<string, string>();
    betterPlans.forEach(plan => {
      plan.coverage?.forEach(country => {
        countryMap.set(country.name, country.name);
      });
    });
    return Array.from(countryMap.values()).sort();
  }, [betterPlans]);


  // 获取网站域名
  const getWebsiteDomain = (provider: string): string => {
    const url = getProviderUrl(provider);
    if (url) {
      try {
        return new URL(url).hostname.replace('www.', '');
      } catch {
        return 'website';
      }
    }
    return 'website';
  };

  // 处理跳转到运营商官网
  const handleVisitWebsite = (provider: string) => {
    const url = getProviderUrl(provider);
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open website');
      });
    } else {
      Alert.alert('Not Available', 'Website not available for this provider');
    }
  };

  // 排序和筛选逻辑
  const filteredAndSortedPlans = useMemo(() => {
    let plans = [...betterPlans];

    // 应用国家筛选
    if (selectedCountries.size > 0) {
      plans = plans.filter(plan =>
        plan.coverage?.some(country => 
          selectedCountries.has(country.name)
        )
      );
    }

    // 应用其他筛选
    const selectedFilterKeys = Array.from(selectedFilters);
    if (selectedFilterKeys.length > 0) {
      plans = plans.filter(plan =>
        selectedFilterKeys.every(key => {
          switch (key) {
            case 'voicemail':
              return plan.voicemail === true;
            case 'call-display':
              return plan.call_display === true;
            case 'call-waiting':
              return plan.call_waiting === true;
            case 'suspicious-detection':
              return plan.suspicious_call_detection === true;
            case 'hotspot':
              return plan.hotspot === true;
            case 'conference-call':
              return plan.conference_call === true;
            case 'video-call':
              return plan.video_call === true;
            default:
              return true; // 默认保留所有
          }
        })
      );
    }

    // 应用排序
    switch (selectedSort) {
      case 'price-asc':
        plans.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        plans.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'data-asc':
        plans.sort((a, b) => {
          const dataA = a.data === null ? -1 : a.data;
          const dataB = b.data === null ? -1 : b.data;
          return dataA - dataB;
        });
        break;
      case 'data-desc':
        plans.sort((a, b) => {
          const dataA = a.data === null ? -1 : a.data;
          const dataB = b.data === null ? -1 : b.data;
          return dataB - dataA;
        });
        break;
      default:
        break;
    }

    return plans;
  }, [betterPlans, selectedSort, selectedFilters, selectedCountries]);

  // 获取当前选中的排序和筛选标签
  const getCurrentSortLabel = () => {
    return SORT_OPTIONS.find(option => option.key === selectedSort)?.shortLabel || 'Sort';
  };

  const getCurrentFilterLabel = () => {
    const totalFilters = selectedFilters.size + (selectedCountries.size > 0 ? 1 : 0);
    if (totalFilters === 0) {
      return 'Filter';
    }
    
    return `${totalFilters} Feature${totalFilters > 1 ? 's' : ''}`;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>

      {/* 排序和筛选栏 */}
      <View className="flex-row justify-between px-4 mb-4 pt-2">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="flex-row items-center px-3 py-2 rounded-lg flex-1 mr-2"
          style={{ backgroundColor: Colors.background.primary, borderWidth: 1, borderColor: Colors.border.light }}
        >
          <FontAwesome name="sort-amount-desc" size={16} color={Colors.text.secondary} />
          <Text className="ml-2 flex-1 text-base" style={{ color: Colors.text.primary }}>{getCurrentSortLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center px-3 py-2 rounded-lg flex-1 ml-2"
          style={{ backgroundColor: Colors.background.primary, borderWidth: 1, borderColor: Colors.border.light }}
        >
          <FontAwesome5 name="filter" size={16} color={Colors.text.secondary} />
          <Text className="ml-2 flex-1 text-base" style={{ color: Colors.text.primary }}>{getCurrentFilterLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        {filteredAndSortedPlans.length > 0 ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
          >
            {filteredAndSortedPlans.map((plan, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                  width: '100%',
                }}
              >
                <View className="px-4 py-4">
                  {/* 三列布局 - 第一行 */}
                  <View className="flex-row mb-4 items-end">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold" style={{ color: Colors.text.primary, textAlign: 'left', paddingLeft: 6 }}>
                        {plan.provider || "N/A"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl" style={{ color: Colors.text.primary }}>
                        <Text className="font-semibold">Price:</Text>{" "}
                        ${plan.price || "N/A"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl" style={{ color: Colors.text.primary }}>
                        <Text className="font-semibold">Data:</Text>{" "}
                        {plan.data !== null ? `${plan.data} GB` : "N/A"}
                      </Text>
                    </View>
                  </View>

                  {/* 分隔线 */}
                  <View className="mb-3" style={{ height: 1, backgroundColor: 'rgba(128, 128, 128, 0.2)', marginHorizontal: 0 }} />

                  {/* 三列布局 - 第二行 */}
                  <View className="flex-row mb-2">
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Network:</Text>{" "}
                        {plan.network || "N/A"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Voicemail</Text>{" "}
                        <Text style={{ color: plan.voicemail ? Colors.functional.success : Colors.functional.error }}>
                          {plan.voicemail ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Call Display</Text>{" "}
                        <Text style={{ color: plan.call_display ? Colors.functional.success : Colors.functional.error }}>
                          {plan.call_display ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* 三列布局 - 第三行 */}
                  <View className="flex-row mb-2">
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Call Waiting</Text>{" "}
                        <Text style={{ color: plan.call_waiting ? Colors.functional.success : Colors.functional.error }}>
                          {plan.call_waiting ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Hotspot</Text>{" "}
                        <Text style={{ color: plan.hotspot ? Colors.functional.success : Colors.functional.error }}>
                          {plan.hotspot ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Video Call</Text>{" "}
                        <Text style={{ color: plan.video_call ? Colors.functional.success : Colors.functional.error }}>
                          {plan.video_call ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* 三列布局 - 第四行 */}
                  <View className="flex-row mb-2">
                    <View className="flex-1">
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Group Call</Text>{" "}
                        <Text style={{ color: plan.conference_call ? Colors.functional.success : Colors.functional.error }}>
                          {plan.conference_call ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text className="text-lg" style={{ color: Colors.text.primary }}>
                        <Text>Suspicious Call Detection</Text>{" "}
                        <Text style={{ color: plan.suspicious_call_detection ? Colors.functional.success : Colors.functional.error }}>
                          {plan.suspicious_call_detection ? "✓" : "✗"}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Coverage - 最后一行 */}
                  <View className="mb-4">
                    <Text className="text-lg" style={{ color: Colors.text.primary }}>
                      <Text>Coverage:</Text>{" "}
                      {Array.isArray(plan.coverage) 
                        ? plan.coverage.map(country => country.name).join(", ") 
                        : typeof plan.coverage === 'string' 
                        ? plan.coverage 
                        : "N/A"}
                    </Text>
                  </View>

                  {/* 运营商官网按钮 - 卡片最下方 */}
                  {plan.provider && hasProviderUrl(plan.provider) && (
                    <View className="flex-row justify-center mb-3">
                      <TouchableOpacity
                        onPress={() => handleVisitWebsite(plan.provider)}
                        className="px-6 py-3 rounded-full flex-row items-center justify-center"
                        style={{ backgroundColor: Colors.functional.success, width: '60%' }}
                      >
                        <Ionicons name="globe-outline" size={16} color="white" />
                        <Text className="text-base font-medium ml-2" style={{ color: Colors.text.inverse }}>Go to {getWebsiteDomain(plan.provider)}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View>
            <Text className="text-center text-lg mt-10 px-4" style={{ color: Colors.text.secondary }}>
              No plans match your current filters
            </Text>
          </View>
        )}

      </View>

      {/* 非会员时的全页面模糊遮罩 */}
      {!isPremium && (
      // {false && (
        <>
          <BlurView
            intensity={50}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity 
            style={styles.premiumOverlay}
            activeOpacity={1}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>🔒 Premium Content</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* 排序模态框 */}
      <BottomSheetModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort Plans"
      >
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              setSelectedSort(option.key);
              setShowSortModal(false);
            }}
            className="flex-row items-center p-4 rounded-lg mb-3"
            style={{
              backgroundColor: selectedSort === option.key ? Colors.status.successBg : Colors.background.secondary,
              borderWidth: selectedSort === option.key ? 1 : 0,
              borderColor: selectedSort === option.key ? Colors.border.soft : 'transparent'
            }}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={selectedSort === option.key ? Colors.primary.main : Colors.text.secondary}
            />
            <Text className="ml-4 flex-1 text-xl font-semibold" style={{color: selectedSort === option.key ? Colors.primary.main : Colors.text.secondary}}>
              {option.label}
            </Text>
            {selectedSort === option.key && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.primary.main} />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheetModal>

      {/* 筛选模态框 */}
      <BottomSheetModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter"
      >
        {/* All Plans 选项 */}
        <TouchableOpacity
          onPress={() => {
            setSelectedFilters(new Set());
            setSelectedCountries(new Set());
            setIsCoverageExpanded(false);
            setShowFilterModal(false);
          }}
          className="flex-row items-center p-4 rounded-lg mb-3"
          style={{
            backgroundColor: selectedFilters.size === 0 && selectedCountries.size === 0 ? Colors.status.successBg : Colors.background.secondary,
            borderWidth: selectedFilters.size === 0 && selectedCountries.size === 0 ? 1 : 0,
            borderColor: selectedFilters.size === 0 && selectedCountries.size === 0 ? Colors.border.soft : 'transparent'
          }}
        >
          <Ionicons
            name="list"
            size={24}
            color={selectedFilters.size === 0 && selectedCountries.size === 0 ? Colors.primary.main : Colors.text.secondary}
          />
          <Text className="ml-4 flex-1 text-xl font-semibold" style={{color: selectedFilters.size === 0 && selectedCountries.size === 0 ? Colors.primary.main : Colors.text.secondary}}>
            All Plans
          </Text>
          {selectedFilters.size === 0 && selectedCountries.size === 0 && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary.main} />
          )}
        </TouchableOpacity>

        {FILTER_OPTIONS.map((option) => {
          if (option.key === 'coverage') {
            return (
              <View 
                key={option.key} 
                className="mb-3 rounded-lg"
                style={{
                  backgroundColor: selectedCountries.size > 0 || isCoverageExpanded ? Colors.status.successBg : Colors.background.secondary,
                  borderWidth: selectedCountries.size > 0 || isCoverageExpanded ? 1 : 0,
                  borderColor: selectedCountries.size > 0 || isCoverageExpanded ? Colors.border.soft : 'transparent'
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setIsCoverageExpanded(!isCoverageExpanded);
                  }}
                  className="flex-row items-center p-4"
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={selectedCountries.size > 0 || isCoverageExpanded ? Colors.primary.main : Colors.text.secondary}
                  />
                  <Text className="ml-4 flex-1 text-xl font-semibold" style={{color: selectedCountries.size > 0 || isCoverageExpanded ? Colors.primary.main : Colors.text.secondary}}>
                    {option.label}
                  </Text>
                  <Ionicons 
                    name={isCoverageExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={selectedCountries.size > 0 || isCoverageExpanded ? Colors.primary.main : Colors.text.secondary} 
                  />
                </TouchableOpacity>
                
                {isCoverageExpanded && (
                  <View className="px-4 pb-4">
                    <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: Colors.border.light }}>
                      <View className="flex-row flex-wrap">
                        {availableCountries.map((country, index) => (
                          <TouchableOpacity
                            key={country}
                            onPress={() => {
                              const newSelectedCountries = new Set(selectedCountries);
                              if (newSelectedCountries.has(country)) {
                                newSelectedCountries.delete(country);
                              } else {
                                newSelectedCountries.add(country);
                              }
                              setSelectedCountries(newSelectedCountries);
                            }}
                            className="w-1/3 flex-row items-center mb-2 pr-2"
                          >
                            <Text className="text-base mr-1" style={{ color: Colors.text.secondary }} numberOfLines={1}>
                              {country}
                            </Text>
                            <View className="w-4 h-4 rounded items-center justify-center" style={{
                              backgroundColor: selectedCountries.has(country) ? Colors.functional.success : 'transparent',
                              borderWidth: 2,
                              borderColor: selectedCountries.has(country) ? Colors.functional.success : Colors.border.medium
                            }}>
                              {selectedCountries.has(country) && (
                                <Ionicons name="checkmark" size={10} color="white" />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          }
          
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => {
                const newSelectedFilters = new Set(selectedFilters);
                if (newSelectedFilters.has(option.key)) {
                  newSelectedFilters.delete(option.key);
                } else {
                  newSelectedFilters.add(option.key);
                }
                setSelectedFilters(newSelectedFilters);
              }}
              className="flex-row items-center p-4 rounded-lg mb-3"
              style={{
                backgroundColor: selectedFilters.has(option.key) ? Colors.status.successBg : Colors.background.secondary,
                borderWidth: selectedFilters.has(option.key) ? 1 : 0,
                borderColor: selectedFilters.has(option.key) ? Colors.border.soft : 'transparent'
              }}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={selectedFilters.has(option.key) ? Colors.primary.main : Colors.text.secondary}
              />
              <Text className="ml-4 flex-1 text-xl font-semibold" style={{color: selectedFilters.has(option.key) ? Colors.primary.main : Colors.text.secondary}}>
                {option.label}
              </Text>
              <View className="w-6 h-6 rounded items-center justify-center" style={{
                backgroundColor: selectedFilters.has(option.key) ? Colors.functional.success : 'transparent',
                borderWidth: 2,
                borderColor: selectedFilters.has(option.key) ? Colors.functional.success : Colors.border.medium
              }}>
                {selectedFilters.has(option.key) && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheetModal>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionSuccess={() => {
            setShowSubscriptionModal(false);
            // 重新检查 premium 状态
            checkPremiumStatus();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  premiumSubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default BetterPlanScreen;
