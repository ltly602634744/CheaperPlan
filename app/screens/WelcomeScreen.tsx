import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const WelcomeScreen: React.FC = () => {
    const router = useRouter();

    const handleCreateAccount = () => {
        router.push('/screens/RegisterScreen');
    };

    const handleSignIn = () => {
        router.push('/screens/AuthScreen');
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleSection}>
                <Text style={styles.titleText}>
                    Start saving on your mobile plan with CheaperPlan!
                </Text>
            </View>
            
            <View style={styles.buttonSection}>
                <TouchableOpacity 
                    style={styles.createAccountButton}
                    onPress={handleCreateAccount}
                >
                    <Text style={styles.createAccountButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <Text style={styles.termsText}>
                    By signing up, you agree to our{' '}
                    <Text 
                        style={styles.linkText}
                        onPress={() => router.push({
                            pathname: '/screens/ContentDisplayScreen',
                            params: { contentType: 'Terms of Use' }
                        })}
                    >
                        Terms
                    </Text>
                    {' '}and{' '}
                    <Text 
                        style={styles.linkText}
                        onPress={() => router.push({
                            pathname: '/screens/ContentDisplayScreen',
                            params: { contentType: 'Privacy Policy' }
                        })}
                    >
                        Privacy Policy
                    </Text>
                    .
                </Text>
            </View>
            
            <View style={styles.signInSection}>
                <Text style={styles.signInText}>
                    Already have an account?{' '}
                    <Text style={styles.signInLink} onPress={handleSignIn}>
                        Sign in
                    </Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: 20,
  },
  titleSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: Colors.text.primary,
    lineHeight: 40,
  },
  buttonSection: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  createAccountButton: {
    backgroundColor: Colors.button.primaryBg,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: Colors.button.primaryText,
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  linkText: {
    color: Colors.accent.blue,
    textDecorationLine: 'underline',
  },
  signInSection: {
    alignItems: 'center',
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  signInText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  signInLink: {
    color: Colors.accent.blue,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;