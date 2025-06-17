import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
    const [message, setMessage] = useState<string>('Waiting for server response...');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const url = 'http://192.168.0.17:8000/';
    const url = 'https://ez3dgames.com/cheap_api/hello';

    const fetchHello = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(url);
            setMessage(response.data.msg);
        } catch (error) {
            console.error('Error fetching message:', error);
            setMessage('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHello();
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" /> : <Text>{message}</Text>}
            <Button title="Refresh" onPress={fetchHello} disabled={isLoading} />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});