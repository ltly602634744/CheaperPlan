import React from 'react';
import { Switch, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

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
    <View style={{ marginBottom: 20 }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: Colors.background.card, 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 12 
      }}>
        <Text style={[
          { fontSize: 20, fontWeight: '600', color: Colors.text.primary },
          disabled && { opacity: 0.5 }
        ]}>{label}</Text>
        <Switch
          trackColor={{ false: Colors.neutral.medium, true: Colors.primary.main }}
          thumbColor={Colors.neutral.white}
          ios_backgroundColor={Colors.neutral.medium}
          onValueChange={onValueChange}
          value={value}
          disabled={disabled}
        />
      </View>
      {description && (
        <Text style={[
          { fontSize: 16, color: Colors.text.secondary, lineHeight: 20 },
          disabled && { opacity: 0.5 }
        ]}>{description}</Text>
      )}
    </View>
  );
}

 