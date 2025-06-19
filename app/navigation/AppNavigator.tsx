import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import RegisterScreen from "@/app/screens/RegisterScreen";

export type RootStackParamList = {
    Auth: undefined;
    Register: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) return null; // 简单的加载占位符

    return (
        // <NavigationContainer>
            <Stack.Navigator>
                {session ? (
                    <>
                        {/*<Stack.Screen name="Home" component={HomeScreen} />*/}
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                    </>
                ) : (
                    <>
                    <Stack.Screen name="Auth" component={AuthScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        // </NavigationContainer>
    );
};

export default AppNavigator;