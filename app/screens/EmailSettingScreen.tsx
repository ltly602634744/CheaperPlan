import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import InputSettingField from '../components/InputSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function EmailSettingScreen() {
  const { session } = useAuthContext();
  const [email, setEmail] = useState(session?.user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text: string) => {
    console.log('Email input changed:', text);
    setEmail(text);
  };

  const handleSave = useCallback(async () => {
    console.log('Saving email:', email);
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ email: email.trim() });
      console.log("new email is:", email);
      console.log("update result:", { data, error });
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update email');
      } else {
        Alert.alert('Success', 'Email updated successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <SettingPageTemplate title="Email" onSave={handleSave} loading={loading}>
      <InputSettingField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
    </SettingPageTemplate>
  );
} 