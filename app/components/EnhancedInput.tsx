import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';

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
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 4, color: Colors.text.primary, fontWeight: '500' }}>{label}</Text>
      <TextInput
        ref={ref}
        style={[
          {
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: Colors.background.card,
            fontSize: 16,
            height: 48,
            paddingVertical: 0,
            textAlignVertical: 'center',
            includeFontPadding: false,
            lineHeight: Platform.OS === 'android' ? 20 : undefined
          },
          hasError 
            ? { borderColor: Colors.functional.error } 
            : isFocused 
              ? { borderColor: Colors.accent.blue } 
              : { borderColor: Colors.border.light }
        ]}
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
        placeholderTextColor={Colors.text.placeholder}
      />
      {hasError && (
        <Text style={{ color: Colors.functional.error, fontSize: 14, marginTop: 4 }}>{hasError}</Text>
      )}
    </View>
  );
};