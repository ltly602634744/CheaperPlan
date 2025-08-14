import Entypo from '@expo/vector-icons/Entypo';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface YesNoToggleProps {
  field: string;
  label: string;
  value: boolean;
  onValueChange: (field: string, value: boolean) => void;
  showInfoButton?: boolean;
  onInfoPress?: () => void;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  field,
  label,
  value,
  onValueChange,
  showInfoButton = false,
  onInfoPress,
}) => {
  return (
    <View className="mb-1 flex-row items-center">
      <View className="flex-1 flex-row items-center">
        <Text className="text-base font-semibold text-gray-800 mr-2">{label}</Text>
        {showInfoButton && (
          <TouchableOpacity
            onPress={onInfoPress}
            className="ml-1 p-1 -m-1" // Negative margin for larger touch area
          >
            <Entypo name="help-with-circle" size={12} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onValueChange(field, !value)}
        activeOpacity={0.7}
        className="relative bg-gray-200 rounded-full p-1 flex-row h-10 w-20"
      >
        {/* Sliding background */}
        <View
          className={`absolute top-1 bottom-1 w-1/2 bg-blue-500 rounded-full shadow-sm ${
            value ? 'right-1' : 'left-1'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
        
        {/* No label */}
        <View className="flex-1 items-center justify-center z-10">
          <Text
            className={`text-sm font-semibold ${
              !value ? 'text-white' : 'text-gray-600'
            }`}
          >
            No
          </Text>
        </View>
        
        {/* Yes label */}
        <View className="flex-1 items-center justify-center z-10">
          <Text
            className={`text-sm font-semibold ${
              value ? 'text-white' : 'text-gray-600'
            }`}
          >
            Yes
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};