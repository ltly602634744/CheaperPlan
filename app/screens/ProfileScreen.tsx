import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { supabase } from '@/app/services/supabase';
import {useAuthContext} from "@/app/context/AuthContext";

export default function ProfileScreen() {
    const {session, signOut} = useAuthContext();
    const user = session?.user;
    const createdAt = user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A';

    const onLogout = async () => {
        const { error } = await signOut();
        if (error) {
            Alert.alert('Error', `：${error.message}`);
        } else {
            // 导航会自动跳转到 AuthScreen（由 AppNavigator 处理）
            Alert.alert('Succeed', 'Logged out successfully!');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>ID: {user?.id || 'N/A'}</Text>
            <Text style={styles.info}>Email: {user?.email || 'N/A'}</Text>
            <Text style={styles.info}>Registered: {createdAt}</Text>
            <TouchableOpacity style={styles.button} onPress={onLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },
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