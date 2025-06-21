import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import { useAuth } from '../hooks/useAuth';
import { createUserPlan, fetchUserPlan, updateUserPlan } from '@/app/services/planService';
import {useRouter} from "expo-router";

const AddPlanScreen: React.FC = () => {
    const router = useRouter();
    const { session } = useAuth();
    const [plan, setPlan] = useState({
        provider: '',
        data: null as number | null,
        coverage: '',
        voicemail: false,
        price: 0,
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPickerVisible, setPickerVisible] = useState(false);

    useEffect(() => {
        const loadCurrentPlan = async () => {
            if (session?.user.id) {
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
                } else {
                    setIsUpdating(false);
                }
            }
        };
        loadCurrentPlan();
    }, [session?.user.id]);

    const handleSavePlan = async () => {
        if (!session?.user.id) return;

        const userId = session.user.id;
        const { error } = isUpdating
            ? await updateUserPlan(userId, plan)
            : await createUserPlan(userId, plan);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', `${isUpdating ? 'Plan updated' : 'Plan added'} successfully!`);
            router.replace("/profile");
        }
    };

    const handleCancel= async () => {
        if (!session?.user.id) return;
        router.replace("/profile");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container}
                            keyboardShouldPersistTaps="handled" // 💡 关键点
                >
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

                    {/*<View style={[styles.inputGroup, { zIndex: 1000, position: 'relative'}]}>*/}
                    {/*    <Text style={styles.label}>Voicemail</Text>*/}
                    {/*    <RNPickerSelect*/}
                    {/*        onValueChange={(value) => setPlan({ ...plan, voicemail: value })}*/}
                    {/*        items={[*/}
                    {/*            { label: 'No', value: false },*/}
                    {/*            { label: 'Yes', value: true },*/}
                    {/*        ]}*/}
                    {/*        value={plan.voicemail}*/}
                    {/*        style={pickerSelectStyles}*/}
                    {/*        useNativeAndroidPickerStyle={false}*/}
                    {/*        placeholder={{ label: 'Select Yes or No', value: '' }}*/}
                    {/*    />*/}
                    {/*</View>*/}
                    {/*<View style={styles.inputGroup}>*/}
                    {/*    <Text style={styles.label}>Voicemail</Text>*/}
                    {/*    <View style={styles.pickerWrapper}>*/}
                    {/*        <Picker*/}
                    {/*            selectedValue={plan.voicemail}*/}
                    {/*            onValueChange={(value) => setPlan({ ...plan, voicemail: value })}*/}
                    {/*            mode="dialog" // 默认在 iOS 是弹出选择器*/}
                    {/*        >*/}
                    {/*            <Picker.Item label="Select Yes or No" value={null} />*/}
                    {/*            <Picker.Item label="Yes" value={true} />*/}
                    {/*            <Picker.Item label="No" value={false} />*/}
                    {/*        </Picker>*/}
                    {/*    </View>*/}
                    {/*</View>*/}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Voicemail</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setPickerVisible(true)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {plan.voicemail === true
                                    ? 'Yes'
                                    : plan.voicemail === false
                                        ? 'No'
                                        : 'Select Yes or No'}
                            </Text>
                        </TouchableOpacity>

                        <Modal
                            isVisible={isPickerVisible}
                            onBackdropPress={() => setPickerVisible(false)}
                            style={styles.modal}
                            backdropOpacity={Platform.OS === 'android' ? 0.6 : 0.5} // Modified: Higher opacity for Android
                            backdropColor="#000"
                            animationIn={Platform.OS === 'android' ? 'fadeIn' : 'slideInUp'} // Modified: Fade animation for Android
                            animationOut={Platform.OS === 'android' ? 'fadeOut' : 'slideOutDown'} // Modified: Fade animation for Android
                        >
                            <View style={styles.modalContent}>
                                <Picker
                                    selectedValue={plan.voicemail}
                                    onValueChange={(value) => {
                                        setPlan({ ...plan, voicemail: value });
                                        setPickerVisible(false);
                                    }}
                                    style={Platform.OS === 'android' ? styles.pickerAndroid : styles.pickerIOS}
                                    itemStyle={styles.pickerItem}
                                    // useNativeAndroidPickerStyle={false}
                                >
                                    {/*<Picker.Item label="Select Yes or No" value={null} />*/}
                                    <Picker.Item label="Yes" value={true} />
                                    <Picker.Item label="No" value={false} />
                                </Picker>
                            </View>
                        </Modal>
                    </View>
                    <View style={styles.buttonContainer}>
                        {/* 第一个按钮 */}
                        <TouchableOpacity style={styles.button} onPress={handleSavePlan}>
                            <Text style={styles.buttonText}>Save Plan</Text>
                        </TouchableOpacity>
                        {/* 第二个按钮 */}
                        <TouchableOpacity style={styles.button} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default AddPlanScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
        width: '100%',
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
        backgroundColor: 'white',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        overflow: 'hidden',
    },
    pickerButton: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    pickerButtonText: {
        color: '#000',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        paddingBottom: Platform.OS === 'android' ? 20 : 30, // Modified: Less padding for Android
        paddingTop: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        minHeight: Platform.OS === 'android' ? 150 : 200, // Modified: Smaller minHeight for Android
    },
    pickerIOS: { // Added: iOS-specific Picker style
        width: '100%',
        height: 150,
    },
    pickerAndroid: { // Added: Android-specific Picker style
        width: '100%',
        height: 50,
        color: '#000',
    },
    pickerItem: { // Added: Consistent Picker item style
        color: '#000',
        fontSize: 16,
    },
    cancelButton: { // Added: Cancel button style for Android
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    cancelButtonText: { // Added: Cancel button text style
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 40,
        width: '100%',    // 确保有一个明确的宽度
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        color: 'black',
        backgroundColor: 'white',
        position: 'relative',
        zIndex: 10, // ⭐️确保 iOS 下点击不会被 ScrollView 等挡住
    },
    inputAndroid: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: 'black',
        backgroundColor: 'white',
    },
});


