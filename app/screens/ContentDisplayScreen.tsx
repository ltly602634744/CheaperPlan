import { modalContents, ModalContentKey } from "@/app/data";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
                    style={{ 
                        minWidth: Platform.OS === 'android' ? 60 : 80,
                        paddingLeft: Platform.OS === 'android' ? 8 : 0,
                    }}
                >
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    {Platform.OS === 'ios' && (
                        <Text style={{ color: '#007AFF', fontSize: 17, marginLeft: 4 }}>
                            Back
                        </Text>
                    )}
                </TouchableOpacity>
                
                <Text 
                    className="text-lg font-semibold text-gray-800 flex-1"
                    style={{
                        textAlign: 'center',
                        marginHorizontal: Platform.OS === 'android' ? 16 : 0,
                    }}
                >
                    {title}
                </Text>
                
                {/* 右侧占位，保持标题居中 */}
                <View style={{ minWidth: Platform.OS === 'android' ? 60 : 80 }} />
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