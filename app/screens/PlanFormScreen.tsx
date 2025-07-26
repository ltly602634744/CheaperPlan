import { usePlanActions } from "@/app/hooks/usePlanActions";
import { createUserPlan, updateUserPlan } from '@/app/services/planService';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { BooleanPicker } from '../components/BooleanPicker';
import { EnhancedInput } from '../components/EnhancedInput';
import { StringPicker } from '../components/StringPicker';
import { responsive } from '../utils/dimensions';
import eventBus from '../utils/eventBus';

const PlanFormScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { plan, setPlan, isUpdating, session } = usePlanActions();
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<string>('');
  const [tempPickerValue, setTempPickerValue] = useState<boolean | null>(null);
  const [focusedField, setFocusedField] = useState<string>('');
  const [activePicker, setActivePicker] = useState<string>('');
  const [pickerLabel, setPickerLabel] = useState<string>('');
  const [tempStringPickerValue, setTempStringPickerValue] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Input refs for navigation
  const providerRef = useRef<TextInput>(null);
  const dataRef = useRef<TextInput>(null);
  const coverageRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!plan.provider.trim()) {
      newErrors.provider = 'Provider is required';
    }
    if (!plan.network.trim()) {
      newErrors.network = 'Network type is required';
    }
    if (plan.data === null || plan.data === undefined || plan.data < 0) {
      newErrors.data = 'Valid data amount is required';
    }
    if (!plan.coverage.trim()) {
      newErrors.coverage = 'Coverage is required';
    }
    if (plan.price === null || plan.price === undefined || plan.price < 0) {
      newErrors.price = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePlan = async () => {
    if (!session?.user.id) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const userId = session.user.id;
    const { error } = isUpdating
      ? await updateUserPlan(userId, plan)
      : await createUserPlan(userId, plan);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', `${isUpdating ? 'Plan updated' : 'Plan added'} successfully!`);
      // 触发套餐更新事件，通知其他页面刷新
      eventBus.emit('userPlanUpdated');
      router.back();
      // 延迟设置参数，确保返回后再刷新
      setTimeout(() => {
        router.setParams({ refresh: 'true' });
      }, 100);
    }
  };

  const handleCancel = async () => {
    if (!session?.user.id) return;
    router.back();
  };

  // Configure navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleCancel}
          style={{ paddingLeft: 10 }}
        >
          <Text style={{ color: '#007AFF', fontSize: 17 }}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSavePlan}
          style={{ paddingRight: 10 }}
        >
          <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSavePlan, handleCancel]);

  // Helper functions for picker handling
  const handleStringPickerPress = (field: string, label: string, value: string) => {
    console.log(`Opening picker for field: ${field}, label: ${label}, value: ${value}`);
    setPickerField(field);
    setTempStringPickerValue(value);
    setActivePicker(field);
    setPickerLabel(label);
    setPickerVisible(true);
  };

  const handleBooleanPickerPress = (field: string, label: string, value: boolean) => {
    console.log(`Opening boolean picker for field: ${field}, label: ${label}, value: ${value}`);
    setPickerField(field);
    setTempPickerValue(value);
    setActivePicker(field);
    setPickerLabel(label);
    setPickerVisible(true);
  };

  const handleValueChange = (field: string, value: string | number | null) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleBooleanValueChange = (field: string, value: boolean) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleStringValueChange = (field: string, value: string) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleErrorClear = (field: string) => {
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }} 
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 items-center justify-start px-6 py-4 pb-8">
              <Text className="text-xl font-bold text-center mb-6 pt-4">
                {isUpdating ? "Update Plan" : "Add Plan"}
              </Text>

              {/* 基本信息 */}
              <EnhancedInput
                field="provider"
                label="Provider"
                value={plan.provider}
                placeholder="e.g., Verizon, AT&T, Rogers"
                autoCapitalize="words"
                ref={providerRef}
                onSubmitEditing={() => dataRef.current?.focus()}
                returnKeyType="next"
                onValueChange={handleValueChange}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
                errors={errors}
                onErrorClear={handleErrorClear}
              />

              <StringPicker
                field="network"
                label="Network Type"
                value={plan.network}
                options={[
                  { label: '5G', value: '5G' },
                  { label: 'LTE', value: 'LTE' }
                ]}
                onValueChange={handleStringValueChange}
                onPickerPress={handleStringPickerPress}
                activePicker={activePicker}
              />

              <EnhancedInput
                field="data"
                label="Data (GB)"
                value={plan.data}
                placeholder="e.g., 10, 25, unlimited"
                keyboardType="numeric"
                ref={dataRef}
                onSubmitEditing={() => coverageRef.current?.focus()}
                returnKeyType="next"
                formatValue={(val) => {
                  if (val === null || val === undefined) return '';
                  const num = Number(val);
                  return isNaN(num) ? val.toString() : num.toString();
                }}
                parseValue={(text) => {
                  if (text.toLowerCase() === 'unlimited') return 999999;
                  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
                  return isNaN(num) ? null : num;
                }}
                onValueChange={handleValueChange}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
                errors={errors}
                onErrorClear={handleErrorClear}
              />

              <EnhancedInput
                field="coverage"
                label="Coverage Area"
                value={plan.coverage}
                placeholder="e.g., National, Regional, Local"
                autoCapitalize="words"
                ref={coverageRef}
                onSubmitEditing={() => priceRef.current?.focus()}
                returnKeyType="next"
                onValueChange={handleValueChange}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
                errors={errors}
                onErrorClear={handleErrorClear}
              />

              <EnhancedInput
                field="price"
                label="Monthly Price ($)"
                value={plan.price}
                placeholder="29.99"
                keyboardType="decimal-pad"
                ref={priceRef}
                onSubmitEditing={() => Keyboard.dismiss()}
                returnKeyType="done"
                formatValue={(val) => {
                  if (val === null || val === undefined) return '';
                  if (typeof val === 'string' && (val === '.' || val.endsWith('.'))) {
                    return val;
                  }
                  return val.toString();
                }}
                parseValue={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  const parts = cleanText.split('.');
                  if (parts.length > 2) {
                    return plan.price;
                  }
                  if (cleanText === '') return null;
                  if (cleanText === '.' || cleanText.endsWith('.')) {
                    return cleanText as any;
                  }
                  const num = parseFloat(cleanText);
                  return isNaN(num) ? null : num;
                }}
                onValueChange={handleValueChange}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
                errors={errors}
                onErrorClear={handleErrorClear}
              />
              
              <BooleanPicker
                field="voicemail"
                label="Voicemail"
                value={plan.voicemail}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="call_display"
                label="Call Display"
                value={plan.call_display}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="call_waiting"
                label="Call Waiting"
                value={plan.call_waiting}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="suspicious_call_detection"
                label="Suspicious Call Detection"
                value={plan.suspicious_call_detection}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="hotspot"
                label="Hotspot"
                value={plan.hotspot}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="conference_call"
                label="Conference Call"
                value={plan.conference_call}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
              <BooleanPicker
                field="video_call"
                label="Video Call"
                value={plan.video_call}
                onValueChange={handleBooleanValueChange}
                onPickerPress={handleBooleanPickerPress}
                activePicker={activePicker}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* iOS Modal for boolean pickers */}
      {Platform.OS === 'ios' && (
        <Modal
          isVisible={isPickerVisible}
          onBackdropPress={() => {
            console.log('Modal backdrop pressed, closing picker');
            setActivePicker('');
            setPickerLabel('');
            setTempStringPickerValue('');
            setPickerVisible(false);
          }}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          useNativeDriver={true}
          hideModalContentWhileAnimating={true}
          avoidKeyboard={true}
          backdropOpacity={0.5}
        >
          <View className="bg-white rounded-t-xl" style={{ 
            minHeight: responsive.hp(27), 
            paddingBottom: responsive.hp(4) 
          }}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  setActivePicker('');
                  setPickerLabel('');
                  setTempStringPickerValue('');
                  setPickerVisible(false);
                }}
                className="py-1"
              >
                <Text className="text-blue-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">{pickerLabel}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (pickerField === 'network') {
                    if (tempStringPickerValue) {
                      setPlan({ ...plan, [pickerField]: tempStringPickerValue });
                    }
                  } else {
                    if (tempPickerValue !== null) {
                      setPlan({ ...plan, [pickerField]: tempPickerValue });
                    }
                  }
                  setActivePicker('');
                  setPickerLabel('');
                  setTempStringPickerValue('');
                  setPickerVisible(false);
                }}
                className="py-1"
              >
                <Text className="text-blue-500 text-base font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            
            {/* Picker */}
            <View style={{ height: responsive.hp(22) }}>
              {pickerField === 'network' ? (
                <Picker
                  selectedValue={tempStringPickerValue}
                  onValueChange={(value: string) => {
                    console.log(`Network picker value changed to: ${value}`);
                    setTempStringPickerValue(value);
                  }}
                  style={{ height: responsive.hp(22), width:responsive.wp(100)}}
                  itemStyle={{ height: responsive.hp(22), width:responsive.wp(100),color:"black" }}
                >
                  <Picker.Item label="5G" value="5G" />
                  <Picker.Item label="LTE" value="LTE" />
                </Picker>
              ) : (
                <Picker
                  selectedValue={tempPickerValue ?? false}
                  onValueChange={(value: boolean) => {
                    console.log(`Boolean picker value changed to: ${value}`);
                    setTempPickerValue(value);
                  }}
                  style={{ height: responsive.hp(22), width:responsive.wp(100) }}
                  itemStyle={{ height: responsive.hp(22), width:responsive.wp(100), color:"black" }}
                >
                  <Picker.Item label="No" value={false} />
                  <Picker.Item label="Yes" value={true} />
                </Picker>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default PlanFormScreen;