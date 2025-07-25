import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputSettingFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
}

export default function InputSettingField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  secureTextEntry = false,
}: InputSettingFieldProps) {
  const handleChangeText = (text: string) => {
    console.log(`InputSettingField (${label}) onChangeText:`, text);
    onChangeText(text);
  };

  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-gray-800 mb-2">{label}</Text>
      <TextInput
        className={`bg-white border border-gray-300 rounded-lg p-3 text-base ${multiline ? 'min-h-[100px]' : ''}`}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

 