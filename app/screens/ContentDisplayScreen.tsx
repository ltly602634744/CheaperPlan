import { modalContents, ModalContentKey } from "@/app/data";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ContentDisplayScreen() {
    const router = useRouter();
    const { contentType } = useLocalSearchParams();
    
    // 获取内容
    const title = contentType as ModalContentKey;
    const content = modalContents[title] || "Content not found";

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 自定义Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    style={{ minWidth: 80 }}
                >
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    <Text style={{ color: '#007AFF', fontSize: 17, marginLeft: 4 }}>
                        Back
                    </Text>
                </TouchableOpacity>
                
                <Text className="text-lg font-semibold text-gray-800 flex-1 text-center">
                    {title}
                </Text>
                
                {/* 右侧占位，保持标题居中 */}
                <View style={{ minWidth: 80 }} />
            </View>

            <ScrollView 
                className="flex-1 px-6 py-4"
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <Text className="text-gray-700 leading-6 text-base">
                    {content}
                </Text>
                {/* 添加底部间距 */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}