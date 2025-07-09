import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import SettingPageTemplate from '../components/SettingPageTemplate';
import SwitchSettingField from '../components/SwitchSettingField';

export default function NotificationSettingScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 检查通知权限状态
  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setIsEnabled(status === 'granted');
    } catch (error) {
      console.error('检查通知权限失败:', error);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理开关切换
  const handleSwitchToggle = async (value: boolean) => {
    if (value) {
      // 用户想要开启通知，检查当前权限
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status === 'granted') {
        setIsEnabled(true);
      } else if (status === 'denied') {
        // 权限被拒绝，跳转到系统设置
        await Linking.openSettings();
      } else {
        // 权限未确定，请求权限
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        setIsEnabled(newStatus === 'granted');
      }
    } else {
      // 用户想要关闭通知，跳转到系统设置
      await Linking.openSettings();
    }
  };

  // 监听应用状态变化，当用户从设置页面返回时重新检查权限
  useEffect(() => {
    const subscription: NativeEventSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // 应用变为活跃状态时，重新检查权限
          checkNotificationPermission();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  // 组件挂载时检查权限
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const handleSave = () => {
    // 通知设置是实时同步的，不需要额外的保存逻辑
    console.log('Notification setting is automatically synced');
  };

  return (
    <SettingPageTemplate title="Notification" onSave={handleSave}>
      <SwitchSettingField
        label="Notification"
        value={isEnabled}
        onValueChange={handleSwitchToggle}
        description="开启通知以接收重要消息和更新提醒。点击开关将跳转到系统设置页面。"
        disabled={isLoading}
      />
    </SettingPageTemplate>
  );
} 