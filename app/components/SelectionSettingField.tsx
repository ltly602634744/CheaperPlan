import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Option {
  code: string;
  name: string;
  nativeName: string;
}

interface SelectionSettingFieldProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function SelectionSettingField({
  options,
  selectedValue,
  onSelect,
}: SelectionSettingFieldProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.code}
          style={[
            styles.optionRow,
            selectedValue === option.code && styles.selectedRow
          ]}
          onPress={() => onSelect(option.code)}
        >
          <View style={styles.optionInfo}>
            <Text style={styles.optionName}>{option.nativeName}</Text>
            <Text style={styles.optionCode}>{option.name}</Text>
          </View>
          {selectedValue === option.code && (
            <Ionicons name="checkmark" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedRow: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 