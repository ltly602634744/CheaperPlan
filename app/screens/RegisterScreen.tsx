import { useAuth } from "@/app/hooks/useAuth";
import React, { useState } from "react";
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import {useRouter} from "expo-router"; // 导入类型定义

// type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const RegisterScreen: React.FC = () => {
    const router = useRouter()
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // const navigation = useNavigation<HomeScreenNavigationProp>();

    const handleRegister = async () => {
        setLoading(true);
        const { data, error } = await signUp(email, password);

        if (error){
            Alert.alert('Error', error.message);
        } else if (!data.session){
            Alert.alert('Please check your inbox for email verification!');
            router.back();
        }else{
            // Alert.alert('Success', 'Registration successful!');
            // TODO: Handle the email is existing
            router.back();
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
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
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.icon}>🔒</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Password"
                        autoCapitalize="none"
                    />
                </View>
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                    onPress={handleRegister}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RegisterScreen;

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