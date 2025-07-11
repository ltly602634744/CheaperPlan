import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import PaywallModal from "../components/PaywallModal";
import { useAuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";


console.log("BetterPlanScreen loaded")
const BetterPlanScreen: React.FC = () => {
  const { betterPlans } = useRecommendPlans();
  const { session } = useAuthContext();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  // 保存展开的卡片index，-1表示全部折叠
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

  return (
    <View className="flex-1 bg-gray-100 px-2 pt-6">
      <Text className="text-2xl font-bold text-center text-blue-600 mb-4">
        Better Plans
      </Text>
      
      {/* Premium 提示 */}
      {!isPremium && !loading && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 mx-2">
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

      {betterPlans.length > 0 ? (
        <ScrollView>
          {betterPlans.map((plan, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => handleToggle(index)}
              className={index !== betterPlans.length - 1 ? 'mb-4' : ''}
            >
              <View
                className="bg-white p-4 rounded-2xl shadow-lg shadow-black/10 border border-gray-200"
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
        <Text className="text-center text-gray-500 mt-10">
          No better plans available
        </Text>
      )}

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
