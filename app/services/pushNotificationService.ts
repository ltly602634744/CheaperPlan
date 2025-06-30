// hooks/usePushNotifications.ts
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';

import * as Notifications from 'expo-notifications';
import {
  Alert,
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform,
} from 'react-native';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/* ---------- 与弹窗组件通信 ---------- */
let showPermissionDialog: (() => void) | null = null;
let permissionPromiseResolver: ((granted: boolean) => void) | null = null;

export function setPermissionDialog(show: () => void) {
  showPermissionDialog = show;
}

export function resolvePermission(granted: boolean) {
  permissionPromiseResolver?.(granted);
  permissionPromiseResolver = null;
}

/* ---------- 主入口，签名保持不变 ---------- */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) return null;

    const granted = await ensurePermissionGranted();
    if (!granted) return null;

    for (let i = 0; i < 5; i++) {
      const token = await Notifications.getExpoPushTokenAsync();
      if (token?.data) return token.data;
      await sleep(1000);
    }

    console.error('获取推送 token 失败：超过最大重试次数');
  } catch (err) {
    console.error('注册推送失败：', err);
  }

  return null;
}

/* ---------- 内部实现 ---------- */
async function ensurePermissionGranted(): Promise<boolean> {
  let { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;

  ({ status } = await Notifications.requestPermissionsAsync());
  if (status === 'granted') return true;

  return waitForPermissionAfterSettings();
}

function waitForPermissionAfterSettings(): Promise<boolean> {
  // 优先走自定义弹窗
  // if (showPermissionDialog) {
  //   return new Promise(resolve => {
  //     permissionPromiseResolver = resolve;
  //     showPermissionDialog?.();          // 可选调用，避免 TS 报错
  //   });
  // }

  // 兜底 Alert 方案
  return new Promise(resolve => {
    Alert.alert(
      '需要通知权限(alert)',
      '请在系统设置中开启通知权限，然后返回应用。',
      [
        { text: '去设置', onPress: () => Linking.openSettings() },
        { text: '取消', style: 'cancel', onPress: () => resolve(false) },
      ],
      { cancelable: true },
    );

    const sub: NativeEventSubscription = AppState.addEventListener(
      'change',
      async (state: AppStateStatus) => {
        if (state === 'active') {
          sub.remove();
          const { status } = await Notifications.getPermissionsAsync();
          resolve(status === 'granted');
        }
      },
    );
  });
}
