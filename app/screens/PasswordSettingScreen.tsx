import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import InputSettingField from '../components/InputSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';
import { supabase } from '../services/supabase';

export default function PasswordSettingScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const handleSave = useCallback(async () => {
    
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update password');
      } else {
        Alert.alert('Success', 'Password updated successfully');
        // 清空输入框
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword]);

  return (
    <SettingPageTemplate title="Password" onSave={handleSave} loading={loading}>
      <InputSettingField
        label="New Password"
        value={newPassword}
        onChangeText={handleNewPasswordChange}
        placeholder="Enter your new password"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        secureTextEntry={true}
      />
      <InputSettingField
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        placeholder="Confirm your new password"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        secureTextEntry={true}
      />
    </SettingPageTemplate>
  );
} 