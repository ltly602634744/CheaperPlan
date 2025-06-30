// components/PushNotificationPermissionModal.tsx
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
    AppState,
    AppStateStatus,
    Button,
    Modal,
    NativeEventSubscription,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    resolvePermission,
    setPermissionDialog,
} from '@/app/hooks/usePushNotifications';

export const PushNotificationPermissionModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  /* 注册触发方法给 hook */
  useEffect(() => {
    setPermissionDialog(() => setVisible(true));
  }, []);

  /* 监听返回 App 后再次检查权限 */
  useEffect(() => {
    if (!visible) return;

    const sub: NativeEventSubscription = AppState.addEventListener(
      'change',
      async (state: AppStateStatus) => {
        if (state === 'active') {
          const { status } = await Notifications.getPermissionsAsync();
          if (status === 'granted') {
            resolvePermission(true);
            setVisible(false);
          }
        }
      },
    );

    return () => sub.remove();
  }, [visible]);

  const handleCancel = () => {
    resolvePermission(false);
    setVisible(false);
  };

  const handleGoSettings = () => {
    Linking.openSettings();           // 先跳设置，不隐藏弹窗
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>需要通知权限</Text>
          <Text style={styles.desc}>
            请在系统设置中开启通知权限，然后返回应用。
          </Text>
          <View style={styles.row}>
            <Button title="取消" onPress={handleCancel} />
            <View style={styles.spacer} />
            <Button title="去设置" onPress={handleGoSettings} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  spacer: { width: 12 },
});
