import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { updatePassword, isPasswordResetSession, setPasswordResetMode } from '@/app/services/authService';
import { useAuthContext } from '@/app/context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const ResetPasswordScreen: React.FC = () => {
    const router = useRouter();
    const { session } = useAuthContext();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        // 检查是否为有效的密码重置会话
        if (!session || !(await isPasswordResetSession())) {
            Alert.alert('Error', 'Invalid password reset session. Please use the reset link from your email again.');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match. Please check both password fields.');
            return;
        }

        setLoading(true);
        const { error } = await updatePassword(password);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            // 密码更新成功，重置密码重置模式
            setPasswordResetMode(false);
            Alert.alert(
                'Success', 
                'Your password has been updated successfully. You can now sign in with your new password.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/screens/AuthScreen')
                    }
                ]
            );
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.description}>
                    Enter your new password below.
                </Text>
                
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Text style={styles.label}>New Password</Text>
                    <PasswordInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter new password"
                    />
                </View>

                <View style={styles.verticallySpaced}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <PasswordInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                    />
                </View>

                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                        onPress={handleUpdatePassword}
                    >
                        <Text style={styles.buttonText}>Update Password</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    icon: {
        fontSize: 20,
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#99C2FF',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ResetPasswordScreen;