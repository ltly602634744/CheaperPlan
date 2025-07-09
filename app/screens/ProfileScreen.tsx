import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, plan: userPlan, loading } = useUserProfile();
  const { betterPlans } = useRecommendPlans();

  // 计算节省金额
  let maxSavings = 0;
  if (userPlan && betterPlans.length > 0) {
    maxSavings = Math.max(
      ...betterPlans.map(plan => userPlan.price - plan.price)
    );
    if (maxSavings < 0) maxSavings = 0;
  }

  const handleAddPlan = () => {
    if (!user?.id) return;
    router.replace("/screens/PlanFormScreen");
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
    <ScrollView className="flex-1 px-4 pt-8 bg-gray-50">
      <Text className="text-xl font-bold text-center mb-4">Your Plan</Text>

      {/* 新增：节省信息 */}
      {userPlan && betterPlans.length > 0 && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <Text className="text-green-700 text-base font-semibold mb-1">
            🎉 Good news! We found {betterPlans.length} cheaper plans for you
          </Text>
          <Text className="text-green-700 text-base">
            Save up to <Text className="font-bold">${maxSavings}</Text> every month! 
          </Text>
        </View>
      )}

      {userPlan ? (
        <View className="space-y-4">
          <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Text className="text-base text-gray-700 mb-1">
              <Text className="font-semibold">Provider: </Text>
              {userPlan.provider || "N/A"}
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
            <Text className="text-base text-gray-700">
              <Text className="font-semibold">Voicemail: </Text>
              {userPlan.voicemail ? "Yes" : "No"}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg items-center mb-3"
            onPress={handleAddPlan}
          >
            <Text className="text-white font-semibold">Update Your Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 py-3 rounded-lg items-center"
            onPress={handleBetterPlan}
          >
            <Text className="text-white font-semibold">Better Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg items-center mt-4"
            onPress={handleAddPlan}
          >
            <Text className="text-white font-semibold">Add Current Plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;