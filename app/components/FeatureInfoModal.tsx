import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface FeatureInfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const FeatureInfoModal: React.FC<FeatureInfoModalProps> = ({
  visible,
  onClose,
  title,
  description,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 w-full justify-center items-center"
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onPress={() => {}} // Prevent backdrop close when touching content
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800 flex-1">{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                className="ml-4 p-2 -m-2" // Negative margin for larger touch area
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="mb-4">
              <Text className="text-gray-600 text-base leading-6">
                {description}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-blue-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold text-base">Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};