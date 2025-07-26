import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';

interface EnhancedInputProps {
  field: string;
  label: string;
  value: string | number | null;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  ref?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  multiline?: boolean;
  formatValue?: (val: string | number | null) => string;
  parseValue?: (val: string) => string | number | null;
  onValueChange: (field: string, value: string | number | null) => void;
  focusedField: string;
  onFocus: (field: string) => void;
  onBlur: () => void;
  errors: { [key: string]: string };
  onErrorClear: (field: string) => void;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  field,
  label,
  value,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  ref,
  onSubmitEditing,
  returnKeyType = 'next',
  multiline = false,
  formatValue,
  parseValue,
  onValueChange,
  focusedField,
  onFocus,
  onBlur,
  errors,
  onErrorClear
}) => {
  const isFocused = focusedField === field;
  const hasError = errors[field];
  const displayValue = formatValue ? formatValue(value) : (value?.toString() || '');

  return (
    <View className="w-full mb-4">
      <Text className="text-base mb-1 text-gray-700 font-medium">{label}</Text>
      <TextInput
        ref={ref}
        className={`border rounded-lg px-3 bg-white text-base ${
          hasError ? 'border-red-400' : isFocused ? 'border-blue-400' : 'border-gray-300'
        }`}
        style={{
          height: 48,
          paddingVertical: 0,
          textAlignVertical: 'center',
          includeFontPadding: false,
          lineHeight: Platform.OS === 'android' ? 20 : undefined
        }}
        value={displayValue}
        onChangeText={(text) => {
          const parsedValue = parseValue ? parseValue(text) : text;
          onValueChange(field, parsedValue);
          if (errors[field]) {
            onErrorClear(field);
          }
        }}
        onFocus={() => onFocus(field)}
        onBlur={onBlur}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        multiline={multiline}
        placeholderTextColor="#9CA3AF"
      />
      {hasError && (
        <Text className="text-red-500 text-sm mt-1">{hasError}</Text>
      )}
    </View>
  );
};