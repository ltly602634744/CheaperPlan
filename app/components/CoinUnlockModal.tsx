import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { User } from '../types/user';

interface CoinUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => Promise<void>;
  openSubscribe?: () => void;
  onGoPurchase?: () => void;
  loading?: boolean;
  user: User | null;
  profileLoading?: boolean;
}

const CoinUnlockModal: React.FC<CoinUnlockModalProps> = ({
  visible,
  onClose,
  onUnlock,
  openSubscribe,
  onGoPurchase,
  loading = false,
  user,
  profileLoading = false,
}) => {
  const coins = user?.coins ?? 0;
  const canUnlock = coins >= 10 && !loading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white rounded-t-3xl min-h-[40%] max-h-[60%]">
              {/* Header */}
              <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-800">Unlock Plans</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View className="flex-1 p-6 justify-center items-center">
                <View className="flex-row items-center mb-4">
                  <FontAwesome5 name="coins" size={24} color="#F59E42" className="mr-2" />
                  <Text className="text-lg font-bold text-yellow-700">{profileLoading ? '...' : coins}</Text>
                  <Text className="ml-2 text-base text-gray-700">Coins</Text>
                </View>
                <Text className="text-center text-base text-gray-700 mb-6">
                  Unlock all hidden plans for <Text className="font-bold text-yellow-700">10 coins</Text> and view all details.
                </Text>
                <TouchableOpacity
                  className={`w-full py-4 rounded-xl items-center mb-3 ${canUnlock ? 'bg-yellow-400' : 'bg-yellow-500'}`}
                  onPress={canUnlock ? onUnlock : onGoPurchase}
                  disabled={loading}
                >
                  {loading ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-bold ml-2">Processing...</Text>
                    </View>
                  ) : canUnlock ? (
                    <Text className="text-lg font-bold text-white">Unlock for 10 Coins</Text>
                  ) : (
                    <Text className="text-lg font-bold text-white">Go Purchase Coins</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-full py-4 rounded-xl items-center bg-blue-600"
                  onPress={openSubscribe}
                >
                  <Text className="text-lg font-bold text-white">Subscribe to Pro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CoinUnlockModal; 