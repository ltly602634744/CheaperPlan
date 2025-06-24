import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useAuthContext} from "@/app/context/AuthContext";
import {useUserProfile} from "@/app/hooks/useUserProfile";
import {useRouter} from 'expo-router';



const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const {signOut} = useAuthContext();
    const { user:user, plan: userPlan, loading } = useUserProfile();


    const handleLogOut = async () => {
        const { error } = await signOut();
        if (error) {
            Alert.alert('Error', `：${error.message}`);
        } else {
            Alert.alert('Succeed', 'Logged out successfully!');
            router.replace("/screens/AuthScreen");
        }
    }

    const handleAddPlan = async () => {
        if (!user?.id) return;
        router.replace("/screens/PlanFormScreen");
    }

    const handleBetterPlan = async () => {
        if (!user?.id || !userPlan) return;
        router.push("/screens/BetterPlanScreen");
    }

    // const handleDeletePlan = async () => {
    //     if (!user?.id || !userPlan) return;
    //
    //     const { error } = await deleteUserPlan(user.id);
    //     if (error) {
    //         Alert.alert('Error', error.message);
    //     } else {
    //         Alert.alert('Success', 'Plan deleted successfully!');
    //         // 依赖 useUserProfile 重新加载
    //     }
    // };

    if (loading) return <Text style={styles.info}>Loading...</Text>;


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>ID: {user?.id || 'N/A'}</Text>
            <Text style={styles.info}>Email: {user?.email || 'N/A'}</Text>
            <Text style={styles.info}>Registered: {user?.cratedAt}</Text>
            {userPlan ? (
                <>
                    <Text style={styles.info}>Provider: {userPlan.provider || 'N/A'}</Text>
                    <Text style={styles.info}>Coverage: {userPlan.coverage || 'N/A'}</Text>
                    <Text style={styles.info}>Data: {userPlan.data !== null ? `${userPlan.data} GB` : 'N/A'}</Text>
                    <Text style={styles.info}>Price: ${userPlan.price || 'N/A'}</Text>
                    <Text style={styles.info}>Voicemail: {userPlan.voicemail ? 'Yes' : 'No'}</Text>
                    <View style={[styles.verticallySpaced, styles.mt20]}>
                        <TouchableOpacity style={styles.button} onPress={handleAddPlan}>
                            <Text style={styles.buttonText}>Upgrade Plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleBetterPlan}>
                            <Text style={styles.buttonText}>Better Plan</Text>
                        </TouchableOpacity>
                        {/*<Link href="/screens/PlanFormScreen" asChild replace={true}>*/}
                        {/*    <TouchableOpacity style={styles.button}>*/}
                        {/*        <Text style={styles.buttonText}>Upgrade Plan</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</Link>*/}
                        {/*<Link href="/screens/BetterPlanScreen" asChild replace={false}>*/}
                        {/*    <TouchableOpacity style={styles.button}>*/}
                        {/*        <Text style={styles.buttonText}>Better Plan</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</Link>*/}
                    </View>
                </>
            ) : (
                <View style={[styles.verticallySpaced, styles.mt20]}>
                    <TouchableOpacity style={styles.button} onPress={handleAddPlan}>
                        <Text style={styles.buttonText}>Add Current Plan</Text>
                    </TouchableOpacity>
                </View>
                // <View style={[styles.verticallySpaced, styles.mt20]}>
                //     <Link href="/screens/PlanFormScreen" asChild replace={true}>
                //         <TouchableOpacity style={styles.button}>
                //             <Text style={styles.buttonText}>Add Current Plan</Text>
                //         </TouchableOpacity>
                //     </Link>
                // </View>
            )}
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );

}

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },
    button: {
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});