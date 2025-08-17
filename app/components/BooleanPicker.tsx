import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

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
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 4, color: Colors.text.primary, fontWeight: '500' }}>{label}</Text>
      {Platform.OS === 'android' ? (
        <View style={{ borderWidth: 1, borderColor: Colors.border.light, borderRadius: 8, overflow: 'hidden' }}>
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
            value === null || value === undefined 
              ? { color: Colors.neutral.medium } 
              : { color: Colors.text.primary }
          ]}>
            {value === null || value === undefined ? 'Select Yes or No' : (value ? 'Yes' : 'No')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};