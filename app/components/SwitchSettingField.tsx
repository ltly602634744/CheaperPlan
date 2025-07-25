import React from 'react';
import { Switch, Text, View } from 'react-native';

interface SwitchSettingFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export default function SwitchSettingField({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}: SwitchSettingFieldProps) {
  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center bg-white p-4 rounded-lg mb-3">
        <Text className={`text-base font-semibold text-gray-800 ${disabled ? 'opacity-50' : ''}`}>{label}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onValueChange}
          value={value}
          disabled={disabled}
        />
      </View>
      {description && (
        <Text className={`text-sm text-gray-600 leading-5 ${disabled ? 'opacity-50' : ''}`}>{description}</Text>
      )}
    </View>
  );
}

 