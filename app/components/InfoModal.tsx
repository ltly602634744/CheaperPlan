import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function InfoModal({ visible, onClose, title, content }: InfoModalProps) {
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
            <View className="bg-white rounded-t-3xl min-h-[60%] max-h-[80%]">
              {/* Header */}
              <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-800">{title}</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView className="flex-1 p-6">
                <Text className="text-gray-700 leading-6 text-base">
                  {content}
                </Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
} 