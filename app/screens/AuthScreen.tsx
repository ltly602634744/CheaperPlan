import { useAuth } from "@/app/hooks/useAuth";
import React, { useState } from "react";
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';


const AuthScreen: React.FC = () => {
    const router = useRouter();
    const { signIn } = useAuth();
    // const navigation = useNavigation<HomeScreenNavigationProp>(); // 显式指定类型
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const {data, error } = await signIn(email, password);
        if (error) {
            Alert.alert('Error', error.message);
        }else if (data.session){
            router.replace("/screens/ProfileScreen");
        }
        setLoading(false);
    };

    return (
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
                    onPress={() => handleLogin()}
                >
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
            </View>
            {/* 4. 修改注册按钮，使用 <Link> 组件 */}
            <View style={[styles.verticallySpaced, styles.mt20]}>
                {/*
                  - href 指向的是你在 app 目录下的文件路径。
                  - 例如，对于 app/register.tsx 文件，href 就是 "/register"。
                  - <Link> 组件可以接受 `asChild` prop，这样它就不会渲染自己的 TouchableOpacity，而是把导航功能赋予给它的直接子组件。
                */}
                <Link href="/screens/RegisterScreen" asChild>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});