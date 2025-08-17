import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import PasswordInput from '../components/PasswordInput';
import { Colors } from '../constants/Colors';


const AuthScreen: React.FC = () => {
    const router = useRouter();
    const { signIn } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const {data, error } = await signIn(email, password);
        if (error) {
            Alert.alert('Error', error.message);
        }
        // 不需要手动重定向，_layout.tsx会自动处理登录后的重定向
        setLoading(false);
    };

    const handleRegister= async () => {
        router.push("/screens/RegisterScreen");
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
            <Text style={styles.title}>Log in</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.icon}>✉️</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor={Colors.text.placeholder}
                    />
                </View>
            </View>
            <View style={styles.verticallySpaced}>
                <Text style={styles.label}>Password</Text>
                <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                    onPress={() => handleLogin()}
                >
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.verticallySpaced, styles.mt30]}>
                <Text style={styles.forgotPasswordText}>
                    <Text style={styles.forgotPasswordLink} onPress={() => router.push('/screens/ForgotPasswordScreen')}>
                        Forgot your password?
                    </Text>
                </Text>
            </View>
            <View style={[styles.verticallySpaced, styles.mt10]}>
                <Text style={styles.signUpText}>
                    Don&apos;t have an account?{' '}
                    <Text style={styles.signUpLink} onPress={handleRegister}>
                        Sign up
                    </Text>
                </Text>
            </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default AuthScreen;
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
    mt30: {
        marginTop: 30,
    },
    mt10: {
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border.light,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: Colors.background.card,
    },
    icon: {
        fontSize: 20,
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 18,
        color: Colors.text.primary,
    },
    button: {
        backgroundColor: Colors.accent.blue,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: Colors.button.disabledBg,
    },
    buttonText: {
        color: Colors.text.inverse,
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    signUpText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    signUpLink: {
        color: Colors.accent.blue,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    forgotPasswordText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    forgotPasswordLink: {
        color: Colors.accent.blue,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
