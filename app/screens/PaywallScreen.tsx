// app/screens/PaywallScreen.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

export default function PaywallScreen() {
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { current, all } = await Purchases.getOfferings();
        console.log('RevenueCat Offerings Debug:');
        console.log('Current offering:', current);
        console.log('All offerings:', all);
        
        if (current) {
          console.log('Available packages:', current.availablePackages);
          console.log('Package identifiers:', current.availablePackages.map(p => p.identifier));
        }
        
        // 通过包标识符查找
        const foundPackage = current?.availablePackages.find(p => p.identifier === '$rc_monthly');
        // 或者通过产品标识符查找（备用方案）
        // const foundPackage = current?.availablePackages.find(p => p.product.identifier === 'com.yinghan.cheaperplan.Monthly');
        console.log('Found package:', foundPackage);
        
        setPkg(foundPackage ?? null);
      } catch (error) {
        console.error('Error getting offerings:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buy = async () => {
    if (!pkg) return;
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['Pro']) {
        alert('订阅成功，Pro 已解锁！');
      }
    } catch (e: any) {
      if (!e.userCancelled) alert(`购买失败: ${e.message}`);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!pkg)   return <Text>没有拿到套餐，请检查 RevenueCat Offering 配置</Text>;

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, marginBottom:12 }}>{pkg.product.title}</Text>
      <Text style={{ marginBottom:24 }}>{pkg.product.priceString} / 月</Text>
      <Button title="\subscrip now\" onPress={buy} />
      <Text>wait for tax number</Text>
    </View>
  );
}
