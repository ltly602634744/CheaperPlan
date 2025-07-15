import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useUserProfile } from '../hooks/useUserProfile';
import { updateUserProfile } from '../services/userService';
import eventBus from '../utils/eventBus';

const COIN_PRODUCTS = [
  { id: '10_coins', label: '10 Coins', price: '$1.99' },
  { id: '20_coins', label: '20 Coins', price: '$3.98' },
  { id: '30_coins', label: '30 Coins', price: '$5.95' },
  { id: '50_coins', label: '50 Coins', price: '$9.89' },
  { id: '100_coins', label: '100 Coins', price: '$18.99' },
  { id: '200_coins', label: '200 Coins', price: '$37.98' },
];

export default function CoinPurchaseScreen() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const { user, loading: profileLoading, refetch } = useUserProfile();

  // 加载一次性商品包
  const loadPackage = async (productId?: string) => {
    setLoading(true);
    try {
      const { current, all } = await Purchases.getOfferings();
      console.log('RevenueCat Offerings Debug:');
      console.log('Current offering:', current);
      console.log('All offerings:', all);

      // 根据传入的productId查找对应商品
      let found: PurchasesPackage | null = null;
      if (current && productId) {
        found = current?.availablePackages.find(
          p => p.identifier === productId
        ) || null;
      }
      setPkg(found);
      if (productId && !found) {
        Alert.alert('Error', 'Coin product not found.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load product info.');
    } finally {
      setLoading(false);
    }
  };

  // 购买逻辑
  const handlePurchase = async () => {
    if (selectedIdx === null || !pkg || !user) return;
    setLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      // 金币到账逻辑：根据所选商品id动态变化
      const product = COIN_PRODUCTS[selectedIdx];
      const coinMatch = product.id.match(/(\d+)/);
      const addCoins = coinMatch ? parseInt(coinMatch[1], 10) : 0;
      const newCoins = (user.coins || 0) + addCoins;
      const { error: updateErr } = await updateUserProfile(user.id, { coins: newCoins });
      if (updateErr) throw new Error(updateErr.message || String(updateErr));
      await refetch();
      eventBus.emit('userCoinsUpdated');
      Alert.alert('Success', `Purchase successful! +${addCoins} coins`);
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', e.message || 'Purchase failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 自动加载商品包（首次渲染）
  React.useEffect(() => {
    loadPackage();
  }, []);

  // 点击卡片时动态加载对应商品包
  const handleSelectProduct = (idx: number) => {
    setSelectedIdx(idx);
    const productId = COIN_PRODUCTS[idx].id;
    loadPackage(productId);
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-8 pb-10">
      {/* 顶部金币数标识 */}
      <View className="flex-row items-center justify-end mb-4">
        <FontAwesome5 name="coins" size={20} color="#F59E42" className="mr-2" />
        <Text className="text-base font-bold text-yellow-700">
          {profileLoading ? '...' : user?.coins ?? 0}
        </Text>
      </View>
      <Text className="text-2xl font-bold text-center mb-6">Purchase Coins</Text>
      <View className="flex-row flex-wrap justify-between">
        {COIN_PRODUCTS.map((product, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <TouchableOpacity
              key={idx}
              className={`w-[48%] bg-yellow-50 border rounded-2xl p-4 mb-4 items-center shadow-sm ${isSelected ? 'border-yellow-400' : 'border-yellow-200'}`}
              style={{ minHeight: 140, opacity: isSelected ? 1 : 0.85 }}
              onPress={() => handleSelectProduct(idx)}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="coins" size={36} color="#F59E42" className="mb-2" />
              <Text className="text-lg font-semibold text-yellow-700 mb-2">{product.label}</Text>
              <Text className="text-base text-gray-700 mb-2">{product.price}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="mt-6 mb-8">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${selectedIdx !== null && pkg && !loading ? 'bg-yellow-400' : 'bg-gray-300'}`}
          disabled={selectedIdx === null || !pkg || loading}
          onPress={handlePurchase}
        >
          {loading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-lg font-bold text-white">Buy Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 