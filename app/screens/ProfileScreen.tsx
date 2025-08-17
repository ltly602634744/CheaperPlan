import { useRecommendPlans } from "@/app/hooks/useRecommendPlans";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from '../constants/Colors';
import eventBus from '../utils/eventBus';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, plan: userPlan, loading, refetch } = useUserProfile();
  const { betterPlans, refetch: refetchBetterPlans } = useRecommendPlans();

  // 只在从编辑页面返回时刷新数据
  useFocusEffect(
    useCallback(() => {
      // 如果有refresh参数，说明是从编辑页面返回
      if (params.refresh === 'true') {
        refetch();
        // 清除参数，避免重复刷新
        router.setParams({ refresh: undefined });
      }
    }, [params.refresh, refetch])
  );

  // 监听套餐更新事件，在套餐保存后刷新数据
  useEffect(() => {
    const handlePlanUpdated = async () => {
      // 先刷新用户套餐数据
      await refetch();
      // 然后刷新推荐套餐数据
      await refetchBetterPlans();
    };

    eventBus.on('userPlanUpdated', handlePlanUpdated);

    return () => {
      eventBus.off('userPlanUpdated', handlePlanUpdated);
    };
  }, [refetch, refetchBetterPlans]);

  // 计算节省金额
  let maxSavings = 0;
  if (userPlan && betterPlans.length > 0) {
    maxSavings = Math.max(
      ...betterPlans.map(plan => userPlan.price - plan.price)
    );
    if (maxSavings < 0) maxSavings = 0;
    // 修复浮点数精度问题，保留2位小数
    maxSavings = Math.round(maxSavings * 100) / 100;
  }

  const handleAddPlan = () => {
    if (!user?.id) return;
    router.push("/screens/PlanFormScreen");
  };

  const handleBetterPlan = () => {
    if (!user?.id || !userPlan) return;
    router.push("/(tabs)/BetterPlanScreen");
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text.secondary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>

      {/* 新增：节省信息 */}
      {userPlan && (
        betterPlans.length > 0 && maxSavings > 0 ? (
          <TouchableOpacity style={styles.savingsNotification} onPress={handleBetterPlan}>
            <View style={styles.savingsContent}>
              <Text style={styles.savingsTitle}>
                🎉 We found {betterPlans.filter(plan => userPlan.price > plan.price).length} cheaper plans！
              </Text>
              <Text style={styles.savingsText}>
                Save up to <Text style={styles.boldText}>${maxSavings.toFixed(2)}</Text> per month.{'\n'}That's <Text style={styles.boldText}>${(maxSavings * 12).toFixed(2)}</Text> per year. 
              </Text>
            </View>
            <View style={styles.savingsIcon}>
              <AntDesign name="right" size={20} color={Colors.functional.success} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.savingsNotificationStatic}>
            <Text style={styles.savingsTitle}>
              🎉 Congratulations!
            </Text>
            <Text style={styles.savingsText}>
              Your current plan is one of the best. We'll notify you as soon as we find a cheaper plan. 🔔
            </Text>
          </View>
        )
      )}

      {userPlan ? (
        <View>
          <View style={styles.planCard}>
            {/* 编辑图标 */}
            <TouchableOpacity
              onPress={handleAddPlan}
              style={styles.editButton}
            >
              <FontAwesome6 name="pencil" size={26} color={Colors.primary.main} />
            </TouchableOpacity>
            
            {/* 基本信息 */}
            <Text style={styles.basicInfoText}>
              <Text style={styles.planLabel}>Provider: </Text>
              {userPlan.provider || "N/A"}
            </Text>
            <Text style={styles.basicInfoText}>
              <Text style={styles.planLabel}>Network: </Text>
              {userPlan.network || "N/A"}
            </Text>
            <Text style={styles.basicInfoText}>
              <Text style={styles.planLabel}>Data: </Text>
              {userPlan.data !== null ? `${userPlan.data} GB` : "N/A"}
            </Text>
            <Text style={styles.basicInfoText}>
              <Text style={styles.planLabel}>Price: </Text>${userPlan.price || "N/A"}
            </Text>
            <Text style={styles.basicInfoText}>
              <Text style={styles.planLabel}>Coverage: </Text>
              {userPlan.coverage && userPlan.coverage.length > 0
                ? userPlan.coverage.map(country => country.name).join(", ")
                : "N/A"}
            </Text>
            
            {/* 功能特性 */}
            <View style={styles.featuresSection}>
              {/* 两列布局 */}
              <View style={styles.featuresRow}>
                <View style={styles.featureColumnLeft}>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Voicemail </Text>
                    <AntDesign 
                      name={userPlan.voicemail ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.voicemail ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Call Waiting </Text>
                    <AntDesign 
                      name={userPlan.call_waiting ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.call_waiting ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Conference Call </Text>
                    <AntDesign 
                      name={userPlan.conference_call ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.conference_call ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                </View>
                <View style={styles.featureColumnRight}>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Call Display </Text>
                    <AntDesign 
                      name={userPlan.call_display ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.call_display ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Hotspot </Text>
                    <AntDesign 
                      name={userPlan.hotspot ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.hotspot ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureLabel}>Video Call </Text>
                    <AntDesign 
                      name={userPlan.video_call ? "checkcircle" : "closecircle"} 
                      size={16} 
                      color={userPlan.video_call ? Colors.functional.success : Colors.neutral.medium} 
                    />
                  </View>
                </View>
              </View>
              {/* Suspicious Call Detection 单独一行 */}
              <View style={styles.featureRow}>
                <Text style={styles.featureLabel}>Suspicious Call Detection </Text>
                <AntDesign 
                  name={userPlan.suspicious_call_detection ? "checkcircle" : "closecircle"} 
                  size={16} 
                  color={userPlan.suspicious_call_detection ? Colors.functional.success : Colors.neutral.medium} 
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.addPlanButton}
            onPress={handleAddPlan}
          >
            <Text style={styles.addPlanButtonText}>Add your current plan to start</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: Colors.background.primary,
  },
  savingsNotification: {
    backgroundColor: Colors.status.successBg,
    borderWidth: 1,
    borderColor: Colors.functional.success,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsContent: {
    flex: 4,
  },
  savingsIcon: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  savingsNotificationStatic: {
    backgroundColor: Colors.status.successBg,
    borderWidth: 1,
    borderColor: Colors.functional.success,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  savingsTitle: {
    color: Colors.functional.success,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  savingsText: {
    color: Colors.functional.success,
    fontSize: 14,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    shadowColor: Colors.border.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  planText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planLabel: {
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureColumnLeft: {
    flex: 1,
    paddingRight: 20,
  },
  featureColumnRight: {
    flex: 1,
    paddingLeft: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    color: Colors.text.primary,
  },
  basicInfoText: {
    fontSize: 17,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  addPlanButton: {
    backgroundColor: Colors.button.primaryBg,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addPlanButtonText: {
    color: Colors.button.primaryText,
    fontWeight: '600',
  },
});

export default ProfileScreen;