import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import InfoSettingField from '../components/InfoSettingField';
import SettingPageTemplate from '../components/SettingPageTemplate';

export default function SubscriptionSettingScreen() {
  const handleSave = () => {
    // TODO: 在这里实现保存订阅设置的逻辑
    console.log('Saving subscription setting');
  };

  return (
    <SettingPageTemplate title="Subscription" onSave={handleSave}>
      <InfoSettingField
        label="Subscription"
        value="Plus"
        status="active"
      />
      <InfoSettingField
        label="Status"
        value="Active"
        status="active"
      />
      <InfoSettingField
        label="Next Billing"
        value="2024-01-15"
      />
      
      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
      </TouchableOpacity>
    </SettingPageTemplate>
  );
}

const styles = StyleSheet.create({
  upgradeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 