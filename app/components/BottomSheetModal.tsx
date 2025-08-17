import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  minHeight?: string;
  maxHeight?: string;
}

export default function BottomSheetModal({ 
  visible, 
  onClose, 
  title, 
  children, 
  minHeight = "min-h-[50%]", 
  maxHeight = "max-h-[70%]" 
}: BottomSheetModalProps) {
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
            <View className={`bg-white rounded-t-3xl ${minHeight} ${maxHeight}`}>
              {/* Header */}
              <View className="flex-row justify-between items-center p-6" style={{ borderBottomWidth: 1, borderBottomColor: Colors.border.light }}>
                <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>{title}</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color={Colors.neutral.dark} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView className="flex-1 p-6">
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
} 