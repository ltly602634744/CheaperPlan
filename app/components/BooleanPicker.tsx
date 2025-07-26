import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

interface BooleanPickerProps {
  field: string;
  label: string;
  value: boolean;
  onValueChange: (field: string, value: boolean) => void;
  onPickerPress?: (field: string, label: string, value: boolean) => void;
  activePicker?: string;
}

export const BooleanPicker: React.FC<BooleanPickerProps> = ({
  field,
  label,
  value,
  onValueChange,
  onPickerPress,
  activePicker
}) => {
  return (
    <View className="w-full mb-4">
      <Text className="text-base mb-1 text-gray-700 font-medium">{label}</Text>
      {Platform.OS === 'android' ? (
        <View className="border border-gray-300 rounded-lg overflow-hidden">
          <Picker
            selectedValue={value}
            onValueChange={(newValue) => onValueChange(field, newValue)}
          >
            <Picker.Item label="Select Yes or No" value="" />
            <Picker.Item label="Yes" value={true} />
            <Picker.Item label="No" value={false} />
          </Picker>
        </View>
      ) : (
        <TouchableOpacity
          className={`border rounded-lg justify-center px-3 bg-white ${
            activePicker === field ? 'border-blue-400' : 'border-gray-300'
          }`}
          style={{ height: 48 }}
          onPress={() => onPickerPress?.(field, label, value)}
        >
          <Text className={`text-base ${
            value === null || value === undefined ? 'text-gray-400' : 'text-gray-800'
          }`}>
            {value === null || value === undefined ? 'Select Yes or No' : (value ? 'Yes' : 'No')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};