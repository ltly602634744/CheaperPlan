import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: Colors.background.secondary,
        width: '100%'
      }}
    >
      <Text style={{ fontSize: 18, color: Colors.text.primary }}>{label}</Text>
      <View className="flex-row items-center">
        {typeof value === "string" ? (
          <Text style={{ fontSize: 16, color: Colors.text.secondary, marginRight: 8, maxWidth: 180 }} numberOfLines={1}> 
            {value}
          </Text>
        ) : (
          value
        )}
        {hasArrow && <Ionicons name="chevron-forward" size={18} color={Colors.border.medium} />}
      </View>
    </TouchableOpacity>
  );
}

