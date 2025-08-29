import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { resetPassword } from '@/app/services/authService';
import { Colors } from '../constants/Colors';

const ForgotPasswordScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        const { error } = await resetPassword(email);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setEmailSent(true);
            setCountdown(60);
            Alert.alert(
                'Check your email', 
                'We have sent you a password reset link. Please check your email and follow the instructions.'
            );
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>
            
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

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={[styles.button, (loading || countdown > 0) && styles.buttonDisabled]}
                    disabled={loading || countdown > 0}
                    onPress={handleResetPassword}
                >
                    <Text style={styles.buttonText}>
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Send Reset Link'}
                    </Text>
                </TouchableOpacity>
            </View>

            {emailSent && (
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <Text style={styles.emailSentMessage}>
                        Your email may take a few minutes to arrive. If you don't see it within 10 minutes, please try resending or contact support.
                    </Text>
                </View>
            )}

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Text style={styles.backToSignInText}>
                    Remember your password?{' '}
                    <Text style={styles.backToSignInLink} onPress={() => router.back()}>
                        Back to Sign in
                    </Text>
                </Text>
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
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
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
        backgroundColor: Colors.button.primaryBg,
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: Colors.button.disabledBg,
    },
    buttonText: {
        color: Colors.button.primaryText,
        fontSize: 18,
        fontWeight: '600',
    },
    backToSignInText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    backToSignInLink: {
        color: Colors.accent.blue,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    emailSentMessage: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        backgroundColor: Colors.status.infoBg,
        padding: 12,
        borderRadius: 8,
        lineHeight: 20,
    },
});

export default ForgotPasswordScreen;