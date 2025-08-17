import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

interface InfoSettingFieldProps {
  label: string;
  value: string;
  status?: 'active' | 'inactive' | 'default';
  onPress?: () => void;
}

export default function InfoSettingField({
  label,
  value,
  status = 'default',
  onPress,
}: InfoSettingFieldProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return Colors.functional.success;
      case 'inactive':
        return Colors.functional.error;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: getStatusColor() }]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 