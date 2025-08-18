import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SettingPageTemplateProps {
  title: string;
  onSave?: () => void | Promise<void>;
  loading?: boolean;
  children: React.ReactNode;
  saveButtonText?: string;
}

export default function SettingPageTemplate({ 
  title, 
  onSave, 
  loading = false, 
  children, 
  saveButtonText = "Save" 
}: SettingPageTemplateProps) {
  const router = useRouter();
  const navigation = useNavigation();

  const handleSave = useCallback(async () => {
    try {
      await onSave();
      router.back();
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  }, [onSave, router]);

  // 设置header的保存按钮
  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: onSave ? () => (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
          {Platform.OS === 'android' ? (
            <Ionicons 
              name="checkmark" 
              size={24} 
              color={loading ? Colors.text.disabled : Colors.accent.blue} 
            />
          ) : (
            <Text style={[styles.saveButtonText, loading && styles.loadingText]}>
              {loading ? 'Saving...' : saveButtonText}
            </Text>
          )}
        </TouchableOpacity>
      ) : undefined,
    });
  }, [navigation, title, saveButtonText, loading, handleSave, onSave]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  saveButton: {
    marginRight: Platform.OS === 'android' ? 20 : 16,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 0,
  },
  saveButtonText: {
    color: Colors.accent.blue,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: Colors.text.disabled,
  },
}); 