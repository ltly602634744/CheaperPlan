import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

interface StringPickerProps {
  field: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (field: string, value: string) => void;
  onPickerPress?: (field: string, label: string, value: string) => void;
  activePicker?: string;
}

export const StringPicker: React.FC<StringPickerProps> = ({
  field,
  label,
  value,
  options,
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
            <Picker.Item label={`Select ${label}`} value="" />
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
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
            !value ? 'text-gray-400' : 'text-gray-800'
          }`}>
            {!value ? `Select ${label}` : value}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};