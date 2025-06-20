import React, {useEffect, useState} from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import {createUserPlan, fetchUserPlan, updateUserPlan} from "@/app/services/planService";

const AddPlanScreen: React.FC = () => {
    const { session } = useAuth();
    const navigation = useNavigation();
    const [plan, setPlan] = useState({
        provider: '',
        data: null as number | null,
        coverage: '',
        voicemail: false,
        price: 0,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(()=>{
        const loadCurrentPlan = async () =>{
            if(session?.user.id){
                const { data, error } = await fetchUserPlan(session.user.id);
                if (data) {
                    setPlan({
                        provider: data.provider || '',
                        data: data.data || null,
                        coverage: data.coverage || '',
                        voicemail: data.voicemail || false,
                        price: data.price || 0,
                    });
                    setIsUpdating(true);
                }else{
                    setIsUpdating(false);
                }
            }
        };
        loadCurrentPlan();
    }, [session?.user.id]);

    const handleSavePlan = async () => {
        if (!session?.user.id) return;

        const userId = session.user.id;
        const {error} = isUpdating ? await updateUserPlan(userId, plan): await createUserPlan(userId, plan);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', `${isUpdating ? 'Plan updated' : 'Plan added'} successfully!`);
            // const { refetch } = useUserProfile(userId);
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{isUpdating ? 'Update Plan' : 'Add Plan'}</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Provider</Text>
                <TextInput
                    style={styles.input}
                    value={plan.provider}
                    onChangeText={(text) => setPlan({ ...plan, provider: text })}
                    placeholder="Enter provider"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Data (GB)</Text>
                <TextInput
                    style={styles.input}
                    value={plan.data?.toString() || ''}
                    onChangeText={(text) => setPlan({ ...plan, data: text ? parseFloat(text) : null })}
                    placeholder="Enter data in GB"
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Coverage</Text>
                <TextInput
                    style={styles.input}
                    value={plan.coverage}
                    onChangeText={(text) => setPlan({ ...plan, coverage: text })}
                    placeholder="Enter coverage"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                    style={styles.input}
                    value={plan.price?.toString() || ''}
                    onChangeText={(text) => setPlan({ ...plan, price: text ? parseFloat(text) : 0 })}
                    placeholder="Enter price"
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Voicemail</Text>
                <RNPickerSelect
                    onValueChange={(value) => setPlan({ ...plan, voicemail: value })}
                    items={[
                        { label: 'No', value: false },
                        { label: 'Yes', value: true },
                    ]}
                    value={plan.voicemail}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Select voicemail option', value: null }}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSavePlan}>
                <Text style={styles.buttonText}>Save Plan</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddPlanScreen;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputGroup: {
        width: '80%',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        // overflow: 'hidden',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: 'black',               // ✅ 确保文字可见
        backgroundColor: 'white',     // ✅ 确保点击区域可见
        justifyContent: 'center',     // 可选，对齐文本
    },
});