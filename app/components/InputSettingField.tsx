import React, { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

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
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>{label}</Text>
      <View style={[
        { backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.border.light, borderRadius: 8 },
        multiline && { minHeight: 100 },
        secureTextEntry && { flexDirection: 'row', alignItems: 'center', paddingRight: 12 }
      ]}>
        <TextInput
          style={[
            {
              fontSize: 18,
              height: multiline ? undefined : 52,
              paddingHorizontal: 12,
              paddingVertical: multiline ? 12 : 0,
              textAlignVertical: multiline ? "top" : "center",
              includeFontPadding: false,
              lineHeight: Platform.OS === 'android' ? 20 : undefined
            },
            secureTextEntry && { flex: 1 }
          ]}
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
          placeholderTextColor={Colors.text.placeholder}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Entypo 
              name={isPasswordVisible ? 'eye-with-line' : 'eye'} 
              size={20} 
              color={Colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

 