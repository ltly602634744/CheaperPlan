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
                🎉 We found {betterPlans.filter(plan => userPlan.price > plan.price).length} cheaper plans for you！
              </Text>
              <Text style={styles.savingsText}>
                Save up to <Text style={styles.boldText}>${maxSavings.toFixed(2)}</Text> per month.{'\n'}That's <Text style={styles.boldText}>${(maxSavings * 12).toFixed(2)}</Text> per year. 
              </Text>
            </View>
            <View style={styles.savingsIcon}>
              <AntDesign name="right" size={24} color={Colors.functional.success} />
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
          {/* 搜索条件信息框 */}
          <View style={styles.searchCriteriaCard}>
            <Text style={styles.searchCriteriaTitle}>Based on your plan</Text>
            <Text style={styles.searchCriteriaText}>
              We'll look for <Text style={styles.boldText}>{userPlan.network === 'LTE' ? 'LTE/5G' : userPlan.network || 'LTE/5G'}</Text> plans that cost less than <Text style={styles.boldText}>${userPlan.price || 0}</Text>, include at least <Text style={styles.boldText}>{userPlan.data || 0}GB</Text> of data, cover <Text style={styles.boldText}>{userPlan.coverage && userPlan.coverage.length > 0 ? userPlan.coverage.map(country => country.name).join(', ') : 'your selected areas'}</Text> and provide below services:
            </Text>
            
            {/* 显示用户选择的功能 */}
            <View style={styles.selectedFeaturesContainer}>
              {userPlan.voicemail && <Text style={styles.selectedFeature}>• Voicemail</Text>}
              {userPlan.call_display && <Text style={styles.selectedFeature}>• Call Display</Text>}
              {userPlan.call_waiting && <Text style={styles.selectedFeature}>• Call Waiting</Text>}
              {userPlan.suspicious_call_detection && <Text style={styles.selectedFeature}>• Suspicious Call Detection</Text>}
              {userPlan.hotspot && <Text style={styles.selectedFeature}>• Hotspot</Text>}
              {userPlan.conference_call && <Text style={styles.selectedFeature}>• Conference Call</Text>}
              {userPlan.video_call && <Text style={styles.selectedFeature}>• Video Call</Text>}
              
              {/* 如果没有选择任何功能 */}
              {!userPlan.voicemail && !userPlan.call_display && !userPlan.call_waiting && 
               !userPlan.suspicious_call_detection && !userPlan.hotspot && 
               !userPlan.conference_call && !userPlan.video_call && (
                <Text style={styles.selectedFeature}>• No specific services required</Text>
              )}
            </View>
          </View>
          
          {/* 更新提示框 */}
          <TouchableOpacity style={styles.updateReminderCard} onPress={handleAddPlan}>
            <View style={styles.savingsContent}>
              <Text style={styles.updateReminderText}>
                Keep your plan updated so we can serve you better.
              </Text>
            </View>
            <View style={styles.savingsIcon}>
              <AntDesign name="sync" size={24} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  savingsTitle: {
    color: Colors.functional.success,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  savingsText: {
    color: Colors.functional.success,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
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
  searchCriteriaCard: {
    backgroundColor: Colors.status.infoBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  searchCriteriaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.functional.info,
    marginBottom: 8,
  },
  searchCriteriaText: {
    fontSize: 16,
    color: Colors.functional.info,
    lineHeight: 24,
    marginBottom: 12,
  },
  selectedFeaturesContainer: {
    marginTop: 4,
  },
  selectedFeature: {
    fontSize: 16,
    color: Colors.functional.info,
    marginBottom: 4,
    paddingLeft: 8,
    fontWeight: '600',
  },
  updateReminderCard: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateReminderText: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default ProfileScreen;