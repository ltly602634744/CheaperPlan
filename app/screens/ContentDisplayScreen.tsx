import { modalContents, ModalContentKey } from "@/app/data";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function ContentDisplayScreen() {
    const router = useRouter();
    const { contentType } = useLocalSearchParams();
    
    // 获取内容
    const title = contentType as ModalContentKey;
    const content = modalContents[title] || "Content not found";

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
            {/* 自定义Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border.light, backgroundColor: Colors.background.card }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[
                        { flexDirection: 'row', alignItems: 'center' },
                        { 
                            minWidth: Platform.OS === 'android' ? 60 : 80,
                            paddingLeft: Platform.OS === 'android' ? 8 : 0,
                        }
                    ]}
                >
                    <Ionicons name="chevron-back" size={24} color={Colors.accent.blue} />
                    {Platform.OS === 'ios' && (
                        <Text style={{ color: Colors.accent.blue, fontSize: 17, marginLeft: 4 }}>
                            Back
                        </Text>
                    )}
                </TouchableOpacity>
                
                <Text 
                    style={[
                        { fontSize: 18, fontWeight: '600', color: Colors.text.primary, flex: 1 },
                        {
                            textAlign: 'center',
                            marginHorizontal: Platform.OS === 'android' ? 16 : 0,
                        }
                    ]}
                >
                    {title}
                </Text>
                
                {/* 右侧占位，保持标题居中 */}
                <View style={{ minWidth: Platform.OS === 'android' ? 60 : 80 }} />
            </View>

            <ScrollView 
                style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <Text style={{ color: Colors.text.primary, lineHeight: 24, fontSize: 16 }}>
                    {content}
                </Text>
                {/* 添加底部间距 */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}