import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function Cell({ label, value, onPress, hasArrow = true }: {
  label: string;
  value?: string | React.ReactNode;
  onPress?: () => void;
  hasArrow?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      className="flex-row items-center justify-between px-4 h-14 bg-white"
    >
      <Text className="text-base text-gray-900">{label}</Text>
      <View className="flex-row items-center">
        {typeof value === "string" ? (
          <Text className="text-sm text-gray-500 mr-2 max-w-[180px]" numberOfLines={1}> 
            {value}
          </Text>
        ) : (
          value
        )}
        {hasArrow && <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />}
      </View>
    </TouchableOpacity>
  );
}