// app/screens/PaywallScreen.tsx
import React from 'react';
import { Text, View } from 'react-native';

export default function PaywallScreen() {
  // const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   (async () => {
  //     const { current } = await Purchases.getOfferings();
  //     setPkg(current?.availablePackages.find(p => p.identifier === 'com.yinghan.cheaperplan.Monthly') ?? null);
  //     setLoading(false);
  //   })();
  // }, []);

  // const buy = async () => {
  //   if (!pkg) return;
  //   try {
  //     const { customerInfo } = await Purchases.purchasePackage(pkg);
  //     if (customerInfo.entitlements.active['Pro']) {
  //       alert('订阅成功，Pro 已解锁！');
  //     }
  //   } catch (e: any) {
  //     if (!e.userCancelled) alert(`购买失败: ${e.message}`);
  //   }
  // };

  // if (loading) return <ActivityIndicator />;
  // if (!pkg)   return <Text>没有拿到套餐，请检查 RevenueCat Offering 配置</Text>;

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      {/* <Text style={{ fontSize:20, marginBottom:12 }}>{pkg.product.title}</Text>
      <Text style={{ marginBottom:24 }}>{pkg.product.priceString} / 月</Text> */}
      {/* <Button title="\subscrip now\" onPress={buy} /> */}
      <Text>wait for tax number</Text>
    </View>
  );
}
