import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  inputContainerStyle?: any;
  inputStyle?: any;
  iconStyle?: any;
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Password",
  autoCapitalize = "none",
  style,
  inputContainerStyle,
  inputStyle,
  iconStyle,
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.inputContainer, inputContainerStyle, style]}>
      <Text style={[styles.icon, iconStyle]}>🔒</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={!isPasswordVisible}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={togglePasswordVisibility}
        activeOpacity={0.7}
      >
        <Entypo 
          name={isPasswordVisible ? 'eye-with-line' : 'eye'} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
});