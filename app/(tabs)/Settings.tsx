import Cell from "@/app/components/SettingCell";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const handleLogOut = async () => {
        const { error } = await signOut();
        if (error) {
            Alert.alert('Error', `：${error.message}`);
        } else {
            Alert.alert('Succeed', 'Logged out successfully!');
            router.replace("/screens/AuthScreen");
        }
    }

    return (
    <SafeAreaView className="flex-1 bg-gray-100">
        <ScrollView className="flex-1">
        {/* 第一组：基本信息 */}
        <View className="mt-2 bg-white">
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="Email" value="your.email@email.com" onPress={() => {}} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="Phone" value="(123)456-789" onPress={() => {}} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="个性签名" value="介绍一下自己吧~" onPress={() => {}} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="学校" value="你好，同学！快来填写学校吧~" onPress={() => {}} />
        </View>

        {/* 第二组：账户信息 */}
        <View className="mt-3 bg-white">
            <Cell label="UID" value="310959127" hasArrow={false} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="Notification" value="On" onPress={() => {}} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="Subscription" value="Plus" onPress={() => {}} />
            <View className="h-[0.5px] bg-gray-100 mx-4" />
            <Cell label="Language" value="English" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogOut}>
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});