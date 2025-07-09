import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
        return '#4CAF50';
      case 'inactive':
        return '#F44336';
      default:
        return '#666';
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
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 