import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const WelcomeScreen: React.FC = () => {
    const router = useRouter();

    const handleCreateAccount = () => {
        router.push('/screens/RegisterScreen');
    };

    const handleSignIn = () => {
        router.push('/screens/AuthScreen');
    };

    return (
        <View className="flex-1 bg-white p-5">
            <View className="flex-[3] justify-center items-center pt-20">
                <Text className="text-3xl font-extrabold text-center text-gray-800 leading-10">
                    Start saving on your mobile plan with CheaperPlan!
                </Text>
            </View>
            
            <View className="flex-[2] justify-start items-center pt-5">
                <TouchableOpacity 
                    className="bg-blue-500 rounded-full py-4 px-8 min-w-[200px] items-center"
                    onPress={handleCreateAccount}
                >
                    <Text className="text-white text-lg font-semibold">Create Account</Text>
                </TouchableOpacity>
            </View>
            
            <View className="items-center pb-10 justify-end">
                <Text className="text-base text-gray-600">
                    Already have an account?{' '}
                    <Text className="text-blue-500 font-medium underline" onPress={handleSignIn}>
                        Sign in
                    </Text>
                </Text>
            </View>
        </View>
    );
};

export default WelcomeScreen;