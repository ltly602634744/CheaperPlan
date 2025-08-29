import { usePlanActions } from "@/app/hooks/usePlanActions";
import { Country, fetchCountries } from '@/app/services/countryService';
import { createUserPlan, updateUserPlan } from '@/app/services/planService';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { EnhancedInput } from '../components/EnhancedInput';
import { FeatureInfoModal } from '../components/FeatureInfoModal';
import { YesNoToggle } from '../components/YesNoToggle';
import { Colors } from '../constants/Colors';
import eventBus from '../utils/eventBus';

const PlanFormScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { plan, setPlan, isUpdating, session } = usePlanActions();
  const [focusedField, setFocusedField] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCoverageExpanded, setIsCoverageExpanded] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Set<number>>(new Set());
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  
  // Feature info modal states
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<{title: string; description: string}>({
    title: '',
    description: ''
  });
  
  // 获取国家数据
  useEffect(() => {
    const loadCountries = async () => {
      const { data, error } = await fetchCountries();
      if (data) {
        setAvailableCountries(data);
        
        // 检查Quebec和Canada的选择状态，确保只有一个被选中
        const quebecCanadaSelected = Array.from(selectedCountries).filter(countryId => {
          const country = data.find(c => c.id === countryId);
          return country && (country.name === 'Quebec' || country.name === 'Canada');
        });
        
        if (quebecCanadaSelected.length === 0) {
          // 如果没有选择任何Quebec或Canada，默认选择Canada
          const canadaCountry = data.find(country => country.name === 'Canada');
          if (canadaCountry) {
            setSelectedCountries(prev => new Set([...prev, canadaCountry.id]));
          }
        } else if (quebecCanadaSelected.length > 1) {
          // 如果同时选择了Quebec和Canada，只保留Canada
          const quebecCountry = data.find(country => country.name === 'Quebec');
          if (quebecCountry && selectedCountries.has(quebecCountry.id)) {
            setSelectedCountries(prev => {
              const newSet = new Set(prev);
              newSet.delete(quebecCountry.id);
              return newSet;
            });
          }
        }
      }
      // 错误处理已在service中完成
    };
    
    loadCountries();
  }, []);
  
  // 当plan.coverage变化时，更新selectedCountries
  useEffect(() => {
    if (plan.coverage && typeof plan.coverage === 'string' && availableCountries.length > 0) {
      const countries = plan.coverage.split(',').map(c => c.trim()).filter(c => c.length > 0);
      const countryIds = availableCountries
        .filter(country => countries.includes(country.name))
        .map(country => country.id);
      setSelectedCountries(new Set(countryIds));
    }
  }, [plan.coverage, availableCountries]);
  
  // Input refs for navigation
  const providerRef = useRef<TextInput>(null);
  const dataRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Only validate required fields: provider, data, price
    if (!plan.provider.trim()) {
      newErrors.provider = 'Provider name is required';
    }
    if (plan.data === null || plan.data === undefined || plan.data < 0) {
      newErrors.data = 'Data amount is required and must be greater than 0';
    }
    if (plan.price === null || plan.price === undefined || plan.price < 0) {
      newErrors.price = 'Monthly price is required and must be greater than 0';
    }
    
    // Validate that exactly one of Quebec or Canada is selected
    const quebecCanadaSelected = Array.from(selectedCountries).filter(countryId => {
      const country = availableCountries.find(c => c.id === countryId);
      return country && (country.name === 'Quebec' || country.name === 'Canada');
    });
    
    if (quebecCanadaSelected.length !== 1) {
      newErrors.coverage = 'You must select exactly one of Quebec or Canada';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePlan = async () => {
    if (!session?.user.id) return;
    
    if (!validateForm()) {
      // Show specific error messages for each missing required field
      const errorMessages = [];
      if (errors.provider) errorMessages.push(errors.provider);
      if (errors.data) errorMessages.push(errors.data);
      if (errors.price) errorMessages.push(errors.price);
      if (errors.coverage) errorMessages.push(errors.coverage);
      
      Alert.alert('Please fix the following:', errorMessages.join('\n'));
      return;
    }

    const userId = session.user.id;
    
    // 准备保存的数据，将selectedCountries转换为coverage_ids数组
    const selectedCountryNames = availableCountries
      .filter(country => selectedCountries.has(country.id))
      .map(country => country.name);
    
    const planToSave = {
      ...plan,
      coverage: selectedCountryNames.join(', '), // 保持向后兼容，用于updateUserPlan
      coverage_ids: Array.from(selectedCountries) // RPC需要的ID数组
    };
    
    const { error } = isUpdating
      ? await updateUserPlan(planToSave)
      : await createUserPlan(planToSave);

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
      title: isUpdating ? "Update Plan" : "Add Plan",
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleCancel}
          style={{ 
            paddingLeft: Platform.OS === 'android' ? 20 : 10,
            paddingHorizontal: Platform.OS === 'android' ? 8 : 0,
          }}
        >
          {Platform.OS === 'android' ? (
            <Ionicons name="close" size={24} color={Colors.accent.blue} />
          ) : (
            <Text style={{ color: Colors.accent.blue, fontSize: 17 }}>Cancel</Text>
          )}
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSavePlan}
          style={{ 
            paddingRight: Platform.OS === 'android' ? 20 : 10,
            paddingHorizontal: Platform.OS === 'android' ? 8 : 0,
          }}
        >
          {Platform.OS === 'android' ? (
            <Ionicons name="checkmark" size={24} color={Colors.accent.blue} />
          ) : (
            <Text style={{ color: Colors.accent.blue, fontSize: 17, fontWeight: '600' }}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSavePlan, handleCancel, isUpdating]);

  const handleValueChange = (field: string, value: string | number | null) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleBooleanValueChange = (field: string, value: boolean) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleErrorClear = (field: string) => {
    setErrors({ ...errors, [field]: '' });
  };

  // Handle feature info display
  const handleFeatureInfo = (feature: string) => {
    const featureInfo = {
      '5G': {
        title: '5G Network',
        description: 'Faster speed, lower delay than LTE.'
      },
      'Call Waiting': {
        title: 'Call Waiting',
        description: 'Lets you take another call while you’re already on one.'
      },
      'Hotspot': {
        title: 'Hotspot',
        description: 'Share your mobile data with other devices. Some carriers don’t support this feature — please check with the carrier.'
      },
      'Coverage': {
        title: 'Coverage',
        description: 'If you choose Quebec, we\'ll also look for Canada-wide plans as long as they\'re cheaper. If you choose Canada, we won\'t include Quebec-only plans.'
      },
      'Conference Call': {
        title: 'Conference Call',
        description: 'Lets you talk with multiple people on the same call.'
      }
    };

    const info = featureInfo[feature as keyof typeof featureInfo];
    if (info) {
      setSelectedFeature(info);
      setShowFeatureModal(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }} 
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 32 }}>
              {/* 第一部分：Your Current Plan */}
              <View style={{ width: '100%', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>Your Current Plan</Text>
                <EnhancedInput
                  field="provider"
                  label="Provider"
                  value={plan.provider}
                  placeholder="e.g., Bell, Videotron, Rogers"
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

                <EnhancedInput
                  field="data"
                  label="Data (GB)"
                  value={plan.data}
                  placeholder="e.g., 10, 25, 50"
                  keyboardType="numeric"
                  ref={dataRef}
                  onSubmitEditing={() => priceRef.current?.focus()}
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
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
                  We&apos;ll only recommend plans that are cheaper and offer more data.
                </Text>
              </View>
              <View style={{ width: '100%', height: 4, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />

              {/* 第二部分：Optional Features You Need */}
              <View style={{ width: '100%', marginBottom: 24, marginTop: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 24 }}>Features You Need ( Optional )</Text>
                {/* Coverage Area Selection */}
                <View style={[
                  { borderRadius: 8 },
                  selectedCountries.size > 0 || isCoverageExpanded 
                    ? { backgroundColor: Colors.status.primaryBg, borderWidth: 1, borderColor: Colors.border.soft } 
                    : { backgroundColor: Colors.neutral.lightest, borderWidth: 1, borderColor: Colors.border.light }
                ]}>
                  <TouchableOpacity
                    onPress={() => setIsCoverageExpanded(!isCoverageExpanded)}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                  >
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[
                        { fontSize: 18, fontWeight: '500', marginRight: 8 },
                        selectedCountries.size > 0 || isCoverageExpanded 
                          ? { color: Colors.primary.main } 
                          : { color: Colors.text.primary }
                      ]}>
                        Coverage
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleFeatureInfo('Coverage')}
                        style={{ marginLeft: 4, padding: 4, margin: -4 }}
                      >
                        <Entypo name="help-with-circle" size={14} color={Colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                    <Ionicons 
                      name={isCoverageExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={selectedCountries.size > 0 || isCoverageExpanded ? Colors.primary.main : Colors.text.secondary} 
                    />
                  </TouchableOpacity>
                  
                  {isCoverageExpanded && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border.light, paddingTop: 12 }}>
                        {/* Quebec 和 Canada 单独一行 */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                          {availableCountries
                            .filter(country => country.name === 'Quebec' || country.name === 'Canada')
                            .map((country) => (
                            <TouchableOpacity
                              key={country.id}
                              onPress={() => {
                                const newSelectedCountries = new Set(selectedCountries);
                                const isQuebecOrCanada = country.name === 'Quebec' || country.name === 'Canada';
                                
                                if (isQuebecOrCanada) {
                                  // 对于Quebec和Canada，实现互斥选择逻辑
                                  const otherQuebecCanada = availableCountries.find(c => 
                                    (c.name === 'Quebec' || c.name === 'Canada') && c.id !== country.id
                                  );
                                  
                                  if (newSelectedCountries.has(country.id)) {
                                    // 如果当前选项已被选中，尝试取消选择
                                    // 检查另一个Quebec/Canada是否被选中
                                    if (otherQuebecCanada && newSelectedCountries.has(otherQuebecCanada.id)) {
                                      // 如果另一个也被选中，只取消当前的
                                      newSelectedCountries.delete(country.id);
                                    } else {
                                      // 如果另一个没有被选中，自动选择另一个，取消当前的
                                      newSelectedCountries.delete(country.id);
                                      if (otherQuebecCanada) {
                                        newSelectedCountries.add(otherQuebecCanada.id);
                                      }
                                    }
                                  } else {
                                    // 如果当前选项未被选中，选择它并取消另一个（如果另一个被选中）
                                    newSelectedCountries.add(country.id);
                                    if (otherQuebecCanada && newSelectedCountries.has(otherQuebecCanada.id)) {
                                      newSelectedCountries.delete(otherQuebecCanada.id);
                                    }
                                  }
                                } else {
                                  // 对于其他国家，正常的切换逻辑
                                  if (newSelectedCountries.has(country.id)) {
                                    newSelectedCountries.delete(country.id);
                                  } else {
                                    newSelectedCountries.add(country.id);
                                  }
                                }
                                setSelectedCountries(newSelectedCountries);
                              }}
                              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, margin: 4, borderWidth: 1, borderColor: Colors.border.light }}
                            >
                              <Text style={[
                                { fontSize: 14, marginRight: 8 },
                                selectedCountries.has(country.id) ? { color: Colors.primary.main, fontWeight: '500' } : { color: Colors.text.primary }
                              ]}>
                                {country.name}
                              </Text>
                              <View style={[
                                { width: 16, height: 16, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
                                selectedCountries.has(country.id) 
                                  ? { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main } 
                                  : { borderColor: Colors.neutral.medium }
                              ]}>
                                {selectedCountries.has(country.id) && (
                                  <Ionicons name="checkmark" size={10} color="white" />
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                        
                        {/* International coverage 标题 */}
                        {availableCountries.filter(country => country.name !== 'Quebec' && country.name !== 'Canada').length > 0 && (
                          <View>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 12 }}>
                              International coverage
                            </Text>
                            
                            {/* 其他国家选项 */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                              {availableCountries
                                .filter(country => country.name !== 'Quebec' && country.name !== 'Canada')
                                .map((country) => (
                                <TouchableOpacity
                                  key={country.id}
                                  onPress={() => {
                                    const newSelectedCountries = new Set(selectedCountries);
                                    if (newSelectedCountries.has(country.id)) {
                                      newSelectedCountries.delete(country.id);
                                    } else {
                                      newSelectedCountries.add(country.id);
                                    }
                                    setSelectedCountries(newSelectedCountries);
                                  }}
                                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, margin: 4, borderWidth: 1, borderColor: Colors.border.light }}
                                >
                                  <Text style={[
                                    { fontSize: 14, marginRight: 8 },
                                    selectedCountries.has(country.id) ? { color: Colors.primary.main, fontWeight: '500' } : { color: Colors.text.primary }
                                  ]}>
                                    {country.name}
                                  </Text>
                                  <View style={[
                                    { width: 16, height: 16, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
                                    selectedCountries.has(country.id) 
                                      ? { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main } 
                                      : { borderColor: Colors.neutral.medium }
                                  ]}>
                                    {selectedCountries.has(country.id) && (
                                      <Ionicons name="checkmark" size={10} color="white" />
                                    )}
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
                {errors.coverage && (
                  <Text style={{ color: Colors.functional.error, fontSize: 14, marginTop: 4 }}>{errors.coverage}</Text>
                )}

                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="network"
                  label="5G"
                  value={plan.network === '5G'}
                  onValueChange={(field: string, value: boolean) => {
                    setPlan({ ...plan, network: value ? '5G' : 'LTE' });
                  }}
                  showInfoButton={true}
                  onInfoPress={() => handleFeatureInfo('5G')}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="voicemail"
                  label="Voicemail"
                  value={plan.voicemail}
                  onValueChange={handleBooleanValueChange}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="call_display"
                  label="Call Display"
                  value={plan.call_display}
                  onValueChange={handleBooleanValueChange}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="call_waiting"
                  label="Call Waiting"
                  value={plan.call_waiting}
                  onValueChange={handleBooleanValueChange}
                  showInfoButton={true}
                  onInfoPress={() => handleFeatureInfo('Call Waiting')}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="suspicious_call_detection"
                  label="Suspicious Call Detection"
                  value={plan.suspicious_call_detection}
                  onValueChange={handleBooleanValueChange}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="hotspot"
                  label="Hotspot"
                  value={plan.hotspot}
                  onValueChange={handleBooleanValueChange}
                  showInfoButton={true}
                  onInfoPress={() => handleFeatureInfo('Hotspot')}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="conference_call"
                  label="Conference Call"
                  value={plan.conference_call}
                  onValueChange={handleBooleanValueChange}
                  showInfoButton={true}
                  onInfoPress={() => handleFeatureInfo('Conference Call')}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <YesNoToggle
                  field="video_call"
                  label="Video Call"
                  value={plan.video_call}
                  onValueChange={handleBooleanValueChange}
                />
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.neutral.lightest, marginVertical: 12 }} />
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 8 }}>
                  We&apos;ll make sure to recommend plans that match these needs.
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Feature Info Modal */}
      <FeatureInfoModal
        visible={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        title={selectedFeature.title}
        description={selectedFeature.description}
      />

    </SafeAreaView>
  );
};

export default PlanFormScreen;