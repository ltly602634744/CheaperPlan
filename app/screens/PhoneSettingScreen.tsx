import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import InputSettingField from '../components/InputSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function PhoneSettingScreen() {
  const { session } = useAuthContext();
  const [phone, setPhone] = useState(session?.user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    console.log('Phone input changed:', text);
    setPhone(text);
  };

  const handleSave = useCallback(async () => {
    console.log('Saving phone number:', phone);
    
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ phone: phone.trim() });
      console.log("new phone number is:", phone);
      console.log("update result:", { data, error });
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update phone number');
      } else {
        Alert.alert('Success', 'Phone number updated successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  return (
    <SettingPageTemplate title="Phone" onSave={handleSave} loading={loading}>
      <InputSettingField
        label="Phone"
        value={phone}
        onChangeText={handlePhoneChange}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        editable={!loading}
      />
    </SettingPageTemplate>
  );
} 