import { usePlanActions } from "@/app/hooks/usePlanActions";
import { createUserPlan, updateUserPlan } from '@/app/services/planService';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useNavigation } from "expo-router";
import React, { useState, useRef, useLayoutEffect } from 'react';
import eventBus from '../utils/eventBus';
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

const PlanFormScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { plan, setPlan, isUpdating, session } = usePlanActions();
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Input refs for navigation
  const providerRef = useRef<TextInput>(null);
  const networkRef = useRef<TextInput>(null);
  const dataRef = useRef<TextInput>(null);
  const coverageRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  
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

  // Enhanced input component
  const renderEnhancedInput = ({
    field,
    label,
    value,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    maxLength,
    ref,
    onSubmitEditing,
    returnKeyType = 'next',
    multiline = false,
    formatValue,
    parseValue
  }: {
    field: string;
    label: string;
    value: string | number | null;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    maxLength?: number;
    ref?: React.RefObject<TextInput | null>;
    onSubmitEditing?: () => void;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    multiline?: boolean;
    formatValue?: (val: string | number | null) => string;
    parseValue?: (val: string) => string | number | null;
  }) => {
    const isFocused = focusedField === field;
    const hasError = errors[field];
    const displayValue = formatValue ? formatValue(value) : (value?.toString() || '');
    
    return (
      <View className="w-full mb-4">
        <Text className="text-base mb-1 text-gray-700 font-medium">{label}</Text>
        <TextInput
          ref={ref}
          className={`border rounded-lg px-3 bg-white text-base ${
            hasError ? 'border-red-400' : isFocused ? 'border-blue-400' : 'border-gray-300'
          }`}
          style={{ 
            height: 48,
            paddingVertical: 0,
            textAlignVertical: 'center',
            includeFontPadding: false,
            lineHeight: Platform.OS === 'android' ? 20 : undefined
          }}
          value={displayValue}
          onChangeText={(text) => {
            const parsedValue = parseValue ? parseValue(text) : text;
            setPlan({ ...plan, [field]: parsedValue });
            // Clear error when user starts typing
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField('')}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          multiline={multiline}
          placeholderTextColor="#9CA3AF"
        />
        {hasError && (
          <Text className="text-red-500 text-sm mt-1">{hasError}</Text>
        )}
      </View>
    );
  };

  const renderBooleanPicker = (field: string, label: string, value: boolean) => {
    return (
      <View className="w-full mb-4">
        <Text className="text-base mb-1 text-gray-700 font-medium">{label}</Text>
        {Platform.OS === 'android' ? (
          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={value}
              onValueChange={(newValue) => setPlan({ ...plan, [field]: newValue })}
            >
              <Picker.Item label="Select Yes or No" value="" />
              <Picker.Item label="Yes" value={true} />
              <Picker.Item label="No" value={false} />
            </Picker>
          </View>
        ) : (
          <>
            <TouchableOpacity
              className={`border rounded-lg justify-center px-3 bg-white ${
                value === null || value === undefined ? 'border-gray-300' : 'border-blue-400'
              }`}
              style={{ height: 48 }}
              onPress={() => {
                setPickerField(field);
                setPickerVisible(true);
              }}
            >
              <Text className={`text-base ${
                value === null || value === undefined ? 'text-gray-400' : 'text-gray-800'
              }`}>
                {value === null || value === undefined ? 'Select Yes or No' : (value ? 'Yes' : 'No')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 items-center justify-start px-6 py-4 pb-8">
              <Text className="text-xl font-bold text-center mb-6 pt-4">
                {isUpdating ? "Update Plan" : "Add Plan"}
              </Text>

              {/* 基本信息 */}
              {renderEnhancedInput({
                field: 'provider',
                label: 'Provider',
                value: plan.provider,
                placeholder: 'e.g., Verizon, AT&T, Rogers',
                autoCapitalize: 'words',
                ref: providerRef,
                onSubmitEditing: () => networkRef.current?.focus(),
                returnKeyType: 'next'
              })}

              {renderEnhancedInput({
                field: 'network',
                label: 'Network Type',
                value: plan.network,
                placeholder: 'e.g., LTE, 5G, 4G',
                autoCapitalize: 'characters',
                ref: networkRef,
                onSubmitEditing: () => dataRef.current?.focus(),
                returnKeyType: 'next'
              })}

              {renderEnhancedInput({
                field: 'data',
                label: 'Data (GB)',
                value: plan.data,
                placeholder: 'e.g., 10, 25, unlimited',
                keyboardType: 'numeric',
                ref: dataRef,
                onSubmitEditing: () => coverageRef.current?.focus(),
                returnKeyType: 'next',
                formatValue: (val) => {
                  if (val === null || val === undefined) return '';
                  const num = Number(val);
                  return isNaN(num) ? val.toString() : num.toString();
                },
                parseValue: (text) => {
                  if (text.toLowerCase() === 'unlimited') return 999999;
                  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
                  return isNaN(num) ? null : num;
                }
              })}

              {renderEnhancedInput({
                field: 'coverage',
                label: 'Coverage Area',
                value: plan.coverage,
                placeholder: 'e.g., National, Regional, Local',
                autoCapitalize: 'words',
                ref: coverageRef,
                onSubmitEditing: () => priceRef.current?.focus(),
                returnKeyType: 'next'
              })}

              {renderEnhancedInput({
                field: 'price',
                label: 'Monthly Price ($)',
                value: plan.price,
                placeholder: '29.99',
                keyboardType: 'decimal-pad',
                ref: priceRef,
                onSubmitEditing: () => Keyboard.dismiss(),
                returnKeyType: 'done',
                formatValue: (val) => {
                  if (val === null || val === undefined) return '';
                  // Handle the case where user is typing a decimal point
                  if (typeof val === 'string' && (val === '.' || val.endsWith('.'))) {
                    return val;
                  }
                  return val.toString();
                },
                parseValue: (text) => {
                  // Allow decimal point and numbers only
                  const cleanText = text.replace(/[^0-9.]/g, '');
                  
                  // Prevent multiple decimal points
                  const parts = cleanText.split('.');
                  if (parts.length > 2) {
                    return plan.price; // Return current value if multiple decimal points
                  }
                  
                  if (cleanText === '') return null;
                  
                  // If text ends with decimal point or is just a decimal point, 
                  // we need to store it as a string temporarily
                  if (cleanText === '.' || cleanText.endsWith('.')) {
                    // Store as a special marker that formatValue can handle
                    return cleanText as any;
                  }
                  
                  const num = parseFloat(cleanText);
                  return isNaN(num) ? null : num;
                }
              })}

              {/* 功能特性 */}
              <View className="w-full border-t border-gray-200 pt-6 mt-2">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Plan Features</Text>
              </View>
              
              {renderBooleanPicker('voicemail', 'Voicemail', plan.voicemail)}
              {renderBooleanPicker('call_display', 'Call Display', plan.call_display)}
              {renderBooleanPicker('call_waiting', 'Call Waiting', plan.call_waiting)}
              {renderBooleanPicker('suspicious_call_detection', 'Suspicious Call Detection', plan.suspicious_call_detection)}
              {renderBooleanPicker('hotspot', 'Hotspot', plan.hotspot)}
              {renderBooleanPicker('conference_call', 'Conference Call', plan.conference_call)}
              {renderBooleanPicker('video_call', 'Video Call', plan.video_call)}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* iOS Modal for boolean pickers */}
      {Platform.OS === 'ios' && (
        <Modal
          isVisible={isPickerVisible}
          onBackdropPress={() => setPickerVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          useNativeDriver={true}
          hideModalContentWhileAnimating={true}
        >
          <View className="bg-white rounded-t-xl" style={{ minHeight: 220, paddingBottom: 34 }}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                className="py-1"
              >
                <Text className="text-blue-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Select Option</Text>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                className="py-1"
              >
                <Text className="text-blue-500 text-base font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            
            {/* Picker */}
            <View style={{ height: 180 }}>
              <Picker
                selectedValue={plan[pickerField as keyof typeof plan] ?? false}
                onValueChange={(value) => {
                  setPlan({ ...plan, [pickerField]: value });
                }}
                style={{ height: 180 }}
              >
                <Picker.Item label="No" value={false} />
                <Picker.Item label="Yes" value={true} />
              </Picker>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default PlanFormScreen;