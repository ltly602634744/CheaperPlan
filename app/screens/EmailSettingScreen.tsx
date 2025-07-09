import React, { useState } from 'react';
import { Alert } from 'react-native';
import InputSettingField from '../components/InputSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function EmailSettingScreen() {
  const { session } = useAuthContext();
  const [email, setEmail] = useState(session?.user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Email updated! 请注意查收验证邮件。');
    }
  };

  return (
    <SettingPageTemplate title="Email" onSave={handleSave} loading={loading}>
      <InputSettingField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
    </SettingPageTemplate>
  );
} 