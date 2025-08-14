import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import PasswordInput from '../components/PasswordInput';

// type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const RegisterScreen: React.FC = () => {
    const router = useRouter()
    const { signUp } = useAuthContext();
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // const navigation = useNavigation<HomeScreenNavigationProp>();

    const handleRegister = async () => {
        // 验证邮箱是否一致
        if (email !== confirmEmail) {
            Alert.alert('Error', 'Emails do not match. Please check both email fields.');
            return;
        }

        // 验证密码是否一致
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match. Please check both password fields.');
            return;
        }

        // 检查密码长度
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        const { data, error } = await signUp(email, password);

        if (error) {
            Alert.alert('Error', error.message);
        } else if (!data.session) {
            Alert.alert('Please check your inbox for email verification!');
            router.push('/screens/AuthScreen');
        } else {
            // Alert.alert('Success', 'Registration successful!');
            // TODO: Handle the email is existing
            router.push('/screens/AuthScreen');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            className="flex-1">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Sign up</Text>
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
                                />
                            </View>
                        </View>
                        <View style={styles.verticallySpaced}>
                            <Text style={styles.label}>Confirm Email</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.icon}>✉️</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={(text) => setConfirmEmail(text)}
                                    value={confirmEmail}
                                    placeholder="Confirm your email"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
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
                        <View style={styles.verticallySpaced}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <PasswordInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm Password"
                            />
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                disabled={loading}
                                onPress={handleRegister}
                            >
                                <Text style={styles.buttonText}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Text style={styles.signInText}>
                                Already have an account?{' '}
                                <Text style={styles.signInLink} onPress={() => router.push('/screens/AuthScreen')}>
                                    Sign in
                                </Text>
                            </Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: 150,
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
        textAlignVertical: 'center',
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
    signInText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    signInLink: {
        color: '#007AFF',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});
