import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import BottomSheetModal from "../components/BottomSheetModal";
import PaywallModal from "../components/PaywallModal";
import { useAuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";

console.log("BetterPlanScreen loaded")

// 排序选项
const SORT_OPTIONS = [
  { key: 'price-asc', label: 'Price: Low to High', icon: 'trending-up' },
  { key: 'price-desc', label: 'Price: High to Low', icon: 'trending-down' },
  { key: 'data-asc', label: 'Data: Low to High', icon: 'cellular' },
  { key: 'data-desc', label: 'Data: High to Low', icon: 'cellular' },
];

// 筛选选项
const FILTER_OPTIONS = [
  { key: 'all', label: 'All Plans', icon: 'list' },
  { key: 'voicemail', label: 'With Voicemail', icon: 'mail' },
  { key: 'call-display', label: 'With Call Display', icon: 'call' },
  { key: 'call-waiting', label: 'With Call Waiting', icon: 'call-outline' },
  { key: 'suspicious-detection', label: 'With Suspicious Call Detection', icon: 'shield-checkmark' },
  { key: 'hotspot', label: 'With Hotspot', icon: 'wifi' },
  { key: 'conference-call', label: 'With Conference Call', icon: 'people' },
  { key: 'video-call', label: 'With Video Call', icon: 'videocam' },
];

const BetterPlanScreen: React.FC = () => {
  const { betterPlans } = useRecommendPlans();
  const { session } = useAuthContext();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // 排序和筛选状态
  const [selectedSort, setSelectedSort] = useState('price-asc');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 检查用户 premium 状态的函数
  const checkPremiumStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getUserProfile(session.user.id);
      if (error) {
        console.error('Error fetching user profile:', error);
        setIsPremium(false);
      } else {
        setIsPremium(data?.premium === 'paid');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // 使用 useFocusEffect 替代 useEffect，每次页面获得焦点时都会执行
  useFocusEffect(
    useCallback(() => {
      checkPremiumStatus();
    }, [checkPremiumStatus])
  );

  const handleToggle = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  // 排序和筛选逻辑
  const filteredAndSortedPlans = useMemo(() => {
    let plans = [...betterPlans];

    // 应用筛选
    switch (selectedFilter) {
      case 'voicemail':
        plans = plans.filter(plan => plan.voicemail === true);
        break;
      case 'call-display':
        plans = plans.filter(plan => plan.call_display === true);
        break;
      case 'call-waiting':
        plans = plans.filter(plan => plan.call_waiting === true);
        break;
      case 'suspicious-detection':
        plans = plans.filter(plan => plan.suspicious_call_detection === true);
        break;
      case 'hotspot':
        plans = plans.filter(plan => plan.hotspot === true);
        break;
      case 'conference-call':
        plans = plans.filter(plan => plan.conference_call === true);
        break;
      case 'video-call':
        plans = plans.filter(plan => plan.video_call === true);
        break;
      default:
        break;
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
  }, [betterPlans, selectedSort, selectedFilter]);

  // 获取当前选中的排序和筛选标签
  const getCurrentSortLabel = () => {
    return SORT_OPTIONS.find(option => option.key === selectedSort)?.label || 'Sort';
  };

  const getCurrentFilterLabel = () => {
    return FILTER_OPTIONS.find(option => option.key === selectedFilter)?.label || 'Filter';
  };

      return (
      <View className="flex-1 bg-white">
        {/* 排序和筛选栏 */}
        <View className="flex-row justify-between px-4 mb-4 pt-6">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg flex-1 mr-2"
        >
          <Ionicons name="funnel-outline" size={16} color="#6B7280" />
          <Text className="text-gray-700 ml-2 flex-1">{getCurrentSortLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg flex-1 ml-2"
        >
          <Ionicons name="options-outline" size={16} color="#6B7280" />
          <Text className="text-gray-700 ml-2 flex-1">{getCurrentFilterLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Premium 提示 */}
      {!isPremium && !loading && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 mx-4">
          <Text className="text-yellow-700 text-center text-sm">
            🔒 Subscribe to Pro to see provider details
          </Text>
          <TouchableOpacity onPress={() => setShowPaywall(true)}>
            <Text className="text-blue-600 text-center text-sm font-semibold mt-2">
              Click here to subscribe
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredAndSortedPlans.length > 0 ? (
        <ScrollView className="px-4">
          {filteredAndSortedPlans.map((plan, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => handleToggle(index)}
              className={index !== filteredAndSortedPlans.length - 1 ? 'mb-4' : ''}
            >
              <View
                className="bg-[#F0F7FF] p-4 rounded-2xl shadow-lg shadow-black/10 border border-gray-200"
              >
                {/* 基本信息 */}
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Provider:</Text>{" "}
                  {isPremium ? (plan.provider || "N/A") : "***"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Network:</Text>{" "}
                  {plan.network || "N/A"}
                </Text>
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Coverage:</Text>{" "}
                  {plan.coverage || "N/A"}
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
            </TouchableOpacity>
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
            className={`flex-row items-center p-4 rounded-lg mb-3 ${
              selectedSort === option.key ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}
          >
            <Ionicons 
              name={option.icon as any} 
              size={24} 
              color={selectedSort === option.key ? '#3B82F6' : '#6B7280'} 
            />
            <Text className={`ml-4 flex-1 text-lg ${
              selectedSort === option.key ? 'text-blue-600 font-semibold' : 'text-gray-700'
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
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              setSelectedFilter(option.key);
              setShowFilterModal(false);
            }}
            className={`flex-row items-center p-4 rounded-lg mb-3 ${
              selectedFilter === option.key ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}
          >
            <Ionicons 
              name={option.icon as any} 
              size={24} 
              color={selectedFilter === option.key ? '#3B82F6' : '#6B7280'} 
            />
            <Text className={`ml-4 flex-1 text-lg ${
              selectedFilter === option.key ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}>
              {option.label}
            </Text>
            {selectedFilter === option.key && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheetModal>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscriptionSuccess={() => {
          setShowPaywall(false);
          // 重新检查 premium 状态
          checkPremiumStatus();
        }}
      />
    </View>
  );
};

export default BetterPlanScreen;
