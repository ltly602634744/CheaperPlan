import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <Text style={[styles.label, disabled && styles.disabledText]}>{label}</Text>
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
        <Text style={[styles.description, disabled && styles.disabledText]}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 