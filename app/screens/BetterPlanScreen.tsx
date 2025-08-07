import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BetterPlanCard from "../components/BetterPlanCard";
import BottomSheetModal from "../components/BottomSheetModal";
import SubscriptionModal from "../components/SubscriptionModal";
import { useAuthContext } from "../context/AuthContext";
import { getProviderUrl, hasProviderUrl } from "../data";
import { useUserProfile } from "../hooks/useUserProfile";
import { hasActivePremium } from "../services/subscriptionService";
import { updateUserProfile } from "../services/userService";
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const router = useRouter();

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

  //点击卡片函数
  const handlePress = (index: number, canView: boolean) => {
    if (canView) {
      setExpandedIndex(prev => (prev === index ? null : index));
    } else {
      setShowSubscriptionModal(true);
    }
  }

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
    <View className="flex-1 bg-white">

      {/* 排序和筛选栏 */}
      <View className="flex-row justify-between px-4 mb-4 pt-2">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-lg flex-1 mr-2"
        >
          <FontAwesome name="sort-amount-desc" size={16} color="#374151" />
          <Text className="text-gray-800 ml-2 flex-1 text-sm">{getCurrentSortLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-lg flex-1 ml-2"
        >
          <FontAwesome5 name="filter" size={16} color="#374151" />
          <Text className="text-gray-800 ml-2 flex-1 text-sm">{getCurrentFilterLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#374151" />
        </TouchableOpacity>
      </View>

      {filteredAndSortedPlans.length > 0 ? (
        <ScrollView className="px-4">
          {filteredAndSortedPlans.map((plan, index) => (
            <BetterPlanCard
              key={index}
              isBlurred={!isPremium}
              activeOpacity={0.9}
              onPress={() => handlePress(index, isPremium)}
              className={index !== filteredAndSortedPlans.length - 1 ? 'mb-4' : ''}
            >
              <View
                className="bg-[#F0F7FF] p-4 rounded-2xl shadow-lg shadow-black/10 border border-gray-200 relative"
              >
                {/* 运营商官网按钮 */}
                {plan.provider && hasProviderUrl(plan.provider) && (
                  <TouchableOpacity
                    onPress={() => handleVisitWebsite(plan.provider)}
                    className="absolute top-3 right-3 z-10 bg-blue-500 px-3 py-1 rounded-full flex-row items-center"
                  >
                    <Ionicons name="globe-outline" size={14} color="white" />
                    <Text className="text-white text-xs font-medium ml-1">Visit</Text>
                  </TouchableOpacity>
                )}

                {/* 基本信息 */}
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Provider:</Text>{" "}
                  {plan.provider || "N/A"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Network:</Text>{" "}
                  {plan.network || "N/A"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Coverage:</Text>{" "}
                  {Array.isArray(plan.coverage) 
                    ? plan.coverage.map(country => country.name).join(", ") 
                    : typeof plan.coverage === 'string' 
                    ? plan.coverage 
                    : "N/A"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Data:</Text>{" "}
                  {plan.data !== null ? `${plan.data} GB` : "N/A"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Price:</Text>{" "}
                  ${plan.price || "N/A"}
                </Text>

                {/* Features 折叠/展开 */}
                {expandedIndex === index && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Voicemail:</Text>{" "}
                      {plan.voicemail ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Call Display:</Text>{" "}
                      {plan.call_display ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Call Waiting:</Text>{" "}
                      {plan.call_waiting ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Suspicious Call Detection:</Text>{" "}
                      {plan.suspicious_call_detection ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Hotspot:</Text>{" "}
                      {plan.hotspot ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      <Text className="font-semibold">Conference Call:</Text>{" "}
                      {plan.conference_call ? "Yes" : "No"}
                    </Text>
                    <Text className="text-base text-gray-700">
                      <Text className="font-semibold">Video Call:</Text>{" "}
                      {plan.video_call ? "Yes" : "No"}
                    </Text>
                    {/* 收起提示 */}
                    <Text className="text-center text-blue-500 mt-4">Click to collapse</Text>
                  </View>
                )}
                {/* 折叠时显示展开提示 */}
                {expandedIndex !== index && (
                  <Text className="text-center text-blue-400 mt-3">Click to expand and view more details</Text>
                )}
              </View>
            </BetterPlanCard>
          ))}
        </ScrollView>
      ) : (
        <Text className="text-center text-gray-500 mt-10 px-4">
          No plans match your current filters
        </Text>
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
            className={`flex-row items-center p-4 rounded-lg mb-3 ${selectedSort === option.key ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={selectedSort === option.key ? '#3B82F6' : '#6B7280'}
            />
            <Text className={`ml-4 flex-1 text-lg ${selectedSort === option.key ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}>
              {option.label}
            </Text>
            {selectedSort === option.key && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheetModal>

      {/* 筛选模态框 */}
      <BottomSheetModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Plans"
      >
        {/* All Plans 选项 */}
        <TouchableOpacity
          onPress={() => {
            setSelectedFilters(new Set());
            setSelectedCountries(new Set());
            setIsCoverageExpanded(false);
            setShowFilterModal(false);
          }}
          className={`flex-row items-center p-4 rounded-lg mb-3 ${selectedFilters.size === 0 && selectedCountries.size === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
        >
          <Ionicons
            name="list"
            size={24}
            color={selectedFilters.size === 0 && selectedCountries.size === 0 ? '#3B82F6' : '#6B7280'}
          />
          <Text className={`ml-4 flex-1 text-lg ${selectedFilters.size === 0 && selectedCountries.size === 0 ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
            All Plans
          </Text>
          {selectedFilters.size === 0 && selectedCountries.size === 0 && (
            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
          )}
        </TouchableOpacity>

        {FILTER_OPTIONS.map((option) => {
          if (option.key === 'coverage') {
            return (
              <View 
                key={option.key} 
                className={`mb-3 rounded-lg ${
                  selectedCountries.size > 0 || isCoverageExpanded 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
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
                    color={selectedCountries.size > 0 || isCoverageExpanded ? '#3B82F6' : '#6B7280'}
                  />
                  <Text className={`ml-4 flex-1 text-lg ${
                    selectedCountries.size > 0 || isCoverageExpanded 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                  <Ionicons 
                    name={isCoverageExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={selectedCountries.size > 0 || isCoverageExpanded ? '#3B82F6' : '#6B7280'} 
                  />
                </TouchableOpacity>
                
                {isCoverageExpanded && (
                  <View className="px-4 pb-4">
                    <View className="border-t border-gray-200 pt-3">
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
                            <Text className="text-sm text-gray-700 mr-1" numberOfLines={1}>
                              {country}
                            </Text>
                            <View className={`w-4 h-4 rounded border-2 items-center justify-center ${
                              selectedCountries.has(country) 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`}>
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
              className={`flex-row items-center p-4 rounded-lg mb-3 ${selectedFilters.has(option.key) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={selectedFilters.has(option.key) ? '#3B82F6' : '#6B7280'}
              />
              <Text className={`ml-4 flex-1 text-lg ${selectedFilters.has(option.key) ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                {option.label}
              </Text>
              {selectedFilters.has(option.key) && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          );
        })}
      </BottomSheetModal>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscriptionSuccess={() => {
          setShowSubscriptionModal(false);
          // 重新检查 premium 状态
          checkPremiumStatus();
        }}
      />
    </View>
  );
};

export default BetterPlanScreen;
