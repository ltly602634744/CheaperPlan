import React, { useState } from 'react';
import { Alert } from 'react-native';
import InputSettingField from '../components/InputSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function PhoneSettingScreen() {
  const { session } = useAuthContext();
  const [phone, setPhone] = useState(session?.user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Phone number updated!');
    }
  };

  return (
    <SettingPageTemplate title="Phone" onSave={handleSave} loading={loading}>
      <InputSettingField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        editable={!loading}
      />
    </SettingPageTemplate>
  );
} 