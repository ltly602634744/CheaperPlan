import {fetchBetterPlans} from "@/app/services/betterPlanService";
import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, ActivityIndicator, Button} from 'react-native';
import {RecommendedPlan, UserPlan} from "@/app/types/userPlan";
import {router} from "expo-router";
import {useRecommendPlans} from "@/app/hooks/useRecommendPlans";

const BetterPlanScreen:React.FC = () => {
    const {betterPlans} = useRecommendPlans();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Better Plans</Text>
            {betterPlans.length > 0 ? (
                betterPlans.map((plan, index) => (
                    <View key={index} style={styles.planItem}>
                        <Text>Coverage: {plan.coverage || 'N/A'}</Text>
                        <Text>Data: {plan.data !== null ? `${plan.data} GB` : 'N/A'}</Text>
                        <Text>Price: ${plan.price || 'N/A'}</Text>
                        <Text>Provider: {plan.provider || 'N/A'}</Text>
                        <Text>Voicemail: {plan.voicemail ? 'Yes' : 'No'}</Text>
                    </View>
                ))
            ) : (
                <Text>No better plans available</Text>
            )}

        </View>
    );
}

export default BetterPlanScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    planItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
});