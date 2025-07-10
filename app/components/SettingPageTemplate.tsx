import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingPageTemplateProps {
  title: string;
  onSave: () => void | Promise<void>;
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
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : saveButtonText}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, saveButtonText, loading, handleSave]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  saveButton: {
    marginRight: 16,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 