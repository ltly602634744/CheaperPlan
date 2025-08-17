import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

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
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 4, color: Colors.text.primary, fontWeight: '500' }}>{label}</Text>
      {Platform.OS === 'android' ? (
        <View style={{ borderWidth: 1, borderColor: Colors.border.light, borderRadius: 8, overflow: 'hidden' }}>
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
          style={[
            {
              borderWidth: 1,
              borderRadius: 8,
              justifyContent: 'center',
              paddingHorizontal: 12,
              backgroundColor: Colors.background.card,
              height: 48
            },
            activePicker === field 
              ? { borderColor: Colors.accent.blue } 
              : { borderColor: Colors.border.light }
          ]}
          onPress={() => onPickerPress?.(field, label, value)}
        >
          <Text style={[
            { fontSize: 16 },
            !value 
              ? { color: Colors.neutral.medium } 
              : { color: Colors.text.primary }
          ]}>
            {!value ? `Select ${label}` : value}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};