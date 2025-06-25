// app/hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        alert('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
    }

    try {
        const token = await Notifications.getExpoPushTokenAsync();
        // console.log('Push token:', token.data);
        return token.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}
