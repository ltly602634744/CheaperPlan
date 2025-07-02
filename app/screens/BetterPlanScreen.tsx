import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import React from "react";
import { ScrollView, Text, View } from "react-native";


console.log("BetterPlanScreen loaded")
const BetterPlanScreen: React.FC = () => {
  const { betterPlans } = useRecommendPlans();

  return (
    <View className="flex-1 bg-gray-100 px-2 pt-6">
      <Text className="text-2xl font-bold text-center text-blue-600 mb-4">
        Better Plans
      </Text>

      {betterPlans.length > 0 ? (
        <ScrollView>
          {betterPlans.map((plan, index) => (
            <View key={index} className={index !== betterPlans.length - 1 ? 'mb-4' : ''}>
              <View
                className="bg-white p-4 rounded-2xl shadow-lg shadow-black/10 border border-gray-200"
              >
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
                <Text className="text-base text-gray-800 mb-1">
                  <Text className="font-semibold">Provider:</Text>{" "}
                  {plan.provider || "N/A"}
                </Text>
                <Text className="text-base text-gray-800">
                  <Text className="font-semibold">Voicemail:</Text>{" "}
                  {plan.voicemail ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text className="text-center text-gray-500 mt-10">
          No better plans available
        </Text>
      )}
    </View>
  );
};

export default BetterPlanScreen;
