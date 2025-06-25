// app/_layout.tsx

import {Href, Stack, useRouter} from 'expo-router';
// 1. 导入你的 AuthProvider
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth'; // 确保路径正确
import { useEffect } from 'react';
import { Text, View } from 'react-native'
import * as Notifications from 'expo-notifications';

// 设置全局通知处理程序
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true, // iOS 专用，显示顶部 banner
        shouldShowList: true,   // iOS 专用，显示在通知中心列表中
    }),
});


// 你可能还需要一个内部组件来处理重定向，因为它现在可以安全地使用 useAuth 了
function AppLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const route = response?.notification?.request?.content?.data?.route;
            // 🔁 跳转逻辑：检查通知携带的 route
            if (route) {
                router.push(route as Href);
            }
        });

        return () => subscription.remove();
    }, []);

  useEffect(() => {
    if (loading) return; // 如果正在加载，则不执行任何操作

    // 根据你的逻辑，这里可以决定是否重定向
    // 例如：如果用户未登录，并且当前不在登录/注册页，则强制跳转
    // 注意：这个逻辑需要根据你的路由组来完善，但基本思想是这样
    if (!session) {
      // 假设 auth 和 register 是公共路由
      // 如果用户未登录，可以重定向到登录页
      router.replace('/screens/AuthScreen');
    } else {
      // 如果用户已登录，但处于登录页，可以重定向到主页
      // router.replace('/profile');
    }
  }, [session, loading]);

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
    );
  }

  // 你的 Stack 导航器
  return (
      <Stack>
          <Stack.Screen name="screens/ProfileScreen" options={{headerShown: false, title: ''}}/>
          <Stack.Screen name="screens/AuthScreen" options={{ header: () => <View style={{ height: 160 }} />}}/>
          <Stack.Screen name="screens/RegisterScreen" options={{title: 'Register'}}/>
          <Stack.Screen name="screens/PlanFormScreen" options={{headerTransparent: true, title: ''}}/>
          <Stack.Screen name="screens/BetterPlanScreen" options={{headerShown: true, title: ''}}/>
      </Stack>
  );
}

export default function RootLayout() {
  // 2. 在根布局组件中，使用 AuthProvider 包裹所有内容
  return (
      <AuthProvider>
          {/*<PaperProvider>*/}
          <AppLayout />
          {/*</PaperProvider>*/}
      </AuthProvider>
  );
}