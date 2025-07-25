import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, plan: userPlan, loading, refetch } = useUserProfile();
  const { betterPlans } = useRecommendPlans();
  const [showSavingsNotification, setShowSavingsNotification] = useState(true);

  // 只在从编辑页面返回时刷新数据
  useFocusEffect(
    useCallback(() => {
      // 如果有refresh参数，说明是从编辑页面返回
      if (params.refresh === 'true') {
        refetch();
        // 清除参数，避免重复刷新
        router.setParams({ refresh: undefined });
      }
    }, [params.refresh, refetch])
  );

  // 计算节省金额
  let maxSavings = 0;
  if (userPlan && betterPlans.length > 0) {
    maxSavings = Math.max(
      ...betterPlans.map(plan => userPlan.price - plan.price)
    );
    if (maxSavings < 0) maxSavings = 0;
    // 修复浮点数精度问题，保留2位小数
    maxSavings = Math.round(maxSavings * 100) / 100;
  }

  const handleAddPlan = () => {
    if (!user?.id) return;
    router.push("/screens/PlanFormScreen");
  };

  const handleBetterPlan = () => {
    if (!user?.id || !userPlan) return;
    router.push("/(tabs)/BetterPlanScreen");
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#999" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );

  return (
    <ScrollView className="flex-1 px-4 pt-8 bg-white">

      {/* 新增：节省信息 */}
      {userPlan && betterPlans.length > 0 && maxSavings > 0 && showSavingsNotification && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 relative">
          {/* 关闭按钮 */}
          <TouchableOpacity
            onPress={() => setShowSavingsNotification(false)}
            className="absolute top-1 right-1 p-1"
          >
            <AntDesign name="closecircle" size={20} color="#059669" />
          </TouchableOpacity>
          
          <Text className="text-green-700 text-base font-semibold mb-1">
            🎉 We found {betterPlans.filter(plan => userPlan.price > plan.price).length} cheaper plans for you！
          </Text>
          <Text className="text-green-700 text-base mb-3">
            Save up to <Text className="font-bold">${maxSavings.toFixed(2)}</Text> every month, <Text className="font-bold">${(maxSavings * 12).toFixed(2)}</Text> a year 
          </Text>
          <TouchableOpacity
            className="bg-green-600 py-2 px-4 rounded-lg self-start"
            onPress={handleBetterPlan}
          >
            <Text className="text-white font-semibold">View Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {userPlan ? (
        <View className="space-y-4">
          <View className="bg-[#F7F8FA] p-4 rounded-lg shadow-sm mb-4 relative">
            {/* 编辑图标 */}
            <TouchableOpacity
              onPress={handleAddPlan}
              className="absolute top-3 right-3 z-10"
            >
              <FontAwesome6 name="pencil" size={20} color="#3B82F6" />
            </TouchableOpacity>
            
            {/* 基本信息 */}
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Provider: </Text>
              {userPlan.provider || "N/A"}
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Network: </Text>
              {userPlan.network || "N/A"}
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Coverage: </Text>
              {userPlan.coverage || "N/A"}
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Data: </Text>
              {userPlan.data !== null ? `${userPlan.data} GB` : "N/A"}
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Price: </Text>${userPlan.price || "N/A"}
            </Text>
            
            {/* 功能特性 */}
            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Voicemail: </Text>
                {userPlan.voicemail ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Call Display: </Text>
                {userPlan.call_display ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Call Waiting: </Text>
                {userPlan.call_waiting ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Suspicious Call Detection: </Text>
                {userPlan.suspicious_call_detection ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Hotspot: </Text>
                {userPlan.hotspot ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700 mb-1">
                <Text className="font-semibold">Conference Call: </Text>
                {userPlan.conference_call ? "Yes" : "No"}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Video Call: </Text>
                {userPlan.video_call ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg items-center mt-4"
            onPress={handleAddPlan}
          >
            <Text className="text-white font-semibold">Add your current plan to start</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
};

export default ProfileScreen;