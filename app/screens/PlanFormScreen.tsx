import { usePlanActions } from "@/app/hooks/usePlanActions";
import { createUserPlan, updateUserPlan } from '@/app/services/planService';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
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
  const { plan, setPlan, isUpdating, session } = usePlanActions();
  const [isPickerVisible, setPickerVisible] = useState(false);

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
      router.replace("/(tabs)/ProfileScreen");
    }
  };

  const handleCancel = async () => {
    if (!session?.user.id) return;
    router.replace("/(tabs)/ProfileScreen");
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
            <View className="flex-1 items-center justify-start px-6 py-4">
              <Text className="text-xl font-bold text-center mb-6 pt-4">
                {isUpdating ? "Update Plan" : "Add Plan"}
              </Text>

              <View className="w-full mb-4">
                <Text className="text-base mb-1">Provider</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={plan.provider}
                  onChangeText={(text) => setPlan({ ...plan, provider: text })}
                  placeholder="Enter provider"
                />
              </View>

              <View className="w-full mb-4">
                <Text className="text-base mb-1">Data (GB)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={plan.data?.toString() || ''}
                  onChangeText={(text) => setPlan({ ...plan, data: text ? parseFloat(text) : null })}
                  placeholder="Enter data in GB"
                  keyboardType="numeric"
                />
              </View>

              <View className="w-full mb-4">
                <Text className="text-base mb-1">Coverage</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={plan.coverage}
                  onChangeText={(text) => setPlan({ ...plan, coverage: text })}
                  placeholder="Enter coverage"
                />
              </View>

              <View className="w-full mb-4">
                <Text className="text-base mb-1">Price ($)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={plan.price?.toString() || ''}
                  onChangeText={(text) => setPlan({ ...plan, price: text ? parseFloat(text) : 0 })}
                  placeholder="Enter price"
                  keyboardType="numeric"
                />
              </View>

              <View className="w-full mb-4">
                <Text className="text-base mb-1">Voicemail</Text>
                {Platform.OS === 'android' ? (
                  <View className="border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={plan.voicemail}
                      onValueChange={(value) => setPlan({ ...plan, voicemail: value })}
                    >
                      <Picker.Item label="Select Yes or No" value="" />
                      <Picker.Item label="Yes" value={true} />
                      <Picker.Item label="No" value={false} />
                    </Picker>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      className="h-10 border border-gray-300 rounded-lg justify-center px-3 bg-white"
                      onPress={() => setPickerVisible(true)}
                    >
                      <Text className="text-black">
                        {plan.voicemail
                          ? 'Yes'
                          : !plan.voicemail
                          ? 'No'
                          : 'Select Yes or No'}
                      </Text>
                    </TouchableOpacity>

                    <Modal
                      isVisible={isPickerVisible}
                      onBackdropPress={() => setPickerVisible(false)}
                      style={{ justifyContent: 'flex-end', margin: 0 }}
                    >
                      <View className="bg-white pt-4 pb-8 px-4 rounded-t-xl min-h-[180px]">
                        <Picker
                          selectedValue={plan.voicemail}
                          onValueChange={(value) => {
                            setPlan({ ...plan, voicemail: value });
                            setPickerVisible(false);
                          }}
                        >
                          <Picker.Item label="Yes" value={true} />
                          <Picker.Item label="No" value={false} />
                        </Picker>
                      </View>
                    </Modal>
                  </>
                )}
              </View>

              <View className="flex-row justify-between w-full gap-4 mt-6">
                <TouchableOpacity
                  className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                  onPress={handleSavePlan}
                >
                  <Text className="text-white font-semibold">Save Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-400 rounded-lg py-3 items-center"
                  onPress={handleCancel}
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PlanFormScreen;