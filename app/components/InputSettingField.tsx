import React, { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';

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

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-gray-800 mb-2">{label}</Text>
      <View className={`bg-white border border-gray-300 rounded-lg ${multiline ? 'min-h-[100px]' : ''} ${secureTextEntry ? 'flex-row items-center pr-3' : ''}`}>
        <TextInput
          className={`text-base ${secureTextEntry ? 'flex-1' : ''}`}
          style={{
            height: multiline ? undefined : 48,
            paddingHorizontal: 12,
            paddingVertical: multiline ? 12 : 0,
            textAlignVertical: multiline ? "top" : "center",
            includeFontPadding: false,
            lineHeight: Platform.OS === 'android' ? 20 : undefined
          }}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="p-2"
            activeOpacity={0.7}
          >
            <Entypo 
              name={isPasswordVisible ? 'eye-with-line' : 'eye'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

 