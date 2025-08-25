// app/_layout.tsx

import { Href, Stack, useRouter } from 'expo-router';
// 1. 导入你的 AuthProvider
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Alert, Platform, StatusBar, Text, TextInput, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './constants/Colors';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { isPasswordResetSession, PasswordResetStateManager } from './services/authService';
import { supabase } from './services/supabase';

// 导入 NativeWind 样式
import '../global.css';

// ------ RevenueCat 公钥（请替换成你项目里的实际值） ------
import Constants from 'expo-constants';

const rc_api_key_ios: string = Constants.expoConfig?.extra?.rc_api_key_ios;
const rc_api_key_android: string = Constants.expoConfig?.extra?.rc_api_key_android;

// -----------------------------------------------------------

// 禁用字体缩放
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

// 设置全局通知处理程序
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // iOS 专用，显示顶部 banner
    shouldShowList: true, // iOS 专用，显示在通知中心列表中
  }),
});

// 你可能还需要一个内部组件来处理重定向，因为它现在可以安全地使用 useAuth 了
function AppLayout() {
  const { session, loading } = useAuthContext();
  const router = useRouter();

  // ① 初始化 RevenueCat Purchases SDK，只执行一次
  useEffect(() => {
    Purchases.configure({
      apiKey: Platform.select({
        ios: rc_api_key_ios,
        android: rc_api_key_android,
      }) as string,
    });
  }, []);

  // 可选：当用户登录 / 登出时绑定 RC 用户
  useEffect(() => {
    if (session?.user?.id) {
      Purchases.logIn(session.user.id).catch(() => {});
    } else {
      Purchases.logOut().catch(() => {});
    }
  }, [session]);

  // ② 通知点击处理（保持原逻辑）
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const route = response?.notification?.request?.content?.data?.route;
        if (route) {
          console.log('Notification tapped while app is running, navigating to:', route);
          router.push(route as Href);
        }
      },
    );

    // 处理杀死态点击通知启动 App
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const route = response?.notification?.request?.content?.data?.route;
        if (route) {
          console.log('App launched by notification, navigating to:', route);
          setTimeout(() => {
            router.push(route as Href);
          }, 100);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  // ③ Deep link处理 - 用于密码重置
  useEffect(() => {

    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('reset-password')) {
        console.log('Password reset intent detected');
        
        try {
          // 解析URL - 处理fragment参数（#）和query参数（?）
          let parsedUrl = url;
          if (url.includes('#')) {
            parsedUrl = url.replace('#', '?');
          }
          
          const urlObj = new URL(parsedUrl);
          const accessToken = urlObj.searchParams.get('access_token');
          const refreshToken = urlObj.searchParams.get('refresh_token');
          const type = urlObj.searchParams.get('type');
          const errorCode = urlObj.searchParams.get('error_code');
          const error = urlObj.searchParams.get('error');
          
          // 情况1: 有有效token
          if (type === 'recovery' && accessToken && refreshToken) {
            console.log('Validating password reset tokens...');
            
            try {
              // 方案1: 先设置重置状态，再建立session
              console.log('Setting password reset mode...');
              await PasswordResetStateManager.setPasswordResetMode(true, accessToken);
              
              // 使用token建立session验证其有效性
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (!error && data.session) {
                console.log('Valid password reset tokens verified and session established');
              } else {
                // 如果session建立失败，清理已设置的重置状态
                console.error('Invalid password reset tokens:', error);
                await PasswordResetStateManager.setPasswordResetMode(false);
                Alert.alert('Error', 'Invalid or expired password reset link. Please request a new password reset from the login page.');
              }
            } catch (stateError) {
              console.error('Error setting password reset state:', stateError);
              Alert.alert('Error', 'Failed to initialize password reset. Please try again.');
            }
          }
          // 情况2: 有错误参数
          else if (errorCode || error) {
            const errorMsg = errorCode === 'otp_expired' 
              ? 'Your password reset link has expired.' 
              : 'There was an error with your password reset link.';
            
            Alert.alert(
              'Reset Link Error', 
              `${errorMsg} Please request a new password reset from the login page.`,
              [{ text: 'OK' }]
            );
          }
          // 情况3: 用户直接访问或无效链接
          else {
            Alert.alert(
              'Invalid Reset Link', 
              'This password reset link is invalid or incomplete. Please request a new password reset from the login page.',
              [{ text: 'OK' }]
            );
          }
          
        } catch (err) {
          console.error('Error processing reset link:', err);
          Alert.alert(
            'Link Error', 
            'Unable to process password reset link. Please request a new password reset from the login page.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    // 处理应用已启动时的deep link
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // 处理应用冷启动时的deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  // ③ 登录状态变化时的重定向逻辑
  useEffect(() => {
    if (loading) return;

    const handleAuthStateChange = async () => {
      if (!session) {
        router.replace('/screens/WelcomeScreen');
      } else {
        // 检查是否是密码重置会话
        const isResetSession = await isPasswordResetSession();
        if (isResetSession) {
          console.log('Redirecting to ResetPasswordScreen');
          router.replace('/screens/ResetPasswordScreen');
        } else {
          // 用户已登录，重定向到主应用
          router.replace('/');
        }
      }
    };

    handleAuthStateChange();
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ④ Stack 导航器
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/AuthScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/RegisterScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ForgotPasswordScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/ResetPasswordScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/PlanFormScreen" options={{ title: 'Edit Plan', headerBackTitle: 'Back' }} />
      
      {/* 设置页面 */}
      <Stack.Screen name="screens/EmailSettingScreen" options={{ title: 'Email', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/PasswordSettingScreen" options={{ title: 'Password', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/NotificationSettingScreen" options={{ title: 'Notification', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/SubscriptionScreen" options={{ title: 'My Subscription', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/LanguageSettingScreen" options={{ title: 'Language', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/ContentDisplayScreen" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  // ⑤ 在根布局组件中，使用 SafeAreaProvider 和 AuthProvider 包裹所有内容
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      <AuthProvider>
        {/*<PaperProvider>*/}
        <AppLayout />
        {/*</PaperProvider>*/}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
