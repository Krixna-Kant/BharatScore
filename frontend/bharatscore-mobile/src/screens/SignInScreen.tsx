import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SignInScreen: React.FC = () => {
  const { isSignedIn, userId } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isSignedIn && userId) {
      navigation.navigate('Redirector' as never);
    }
  }, [isSignedIn, userId, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your BharatScore account</Text>
        </View>
        
        <View style={styles.formContainer}>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl="/redirector"
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: '#10b981',
                  color: 'white',
                },
                card: {
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.15,
                  shadowRadius: 15,
                  elevation: 8,
                },
                headerTitle: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#111827',
                },
                headerSubtitle: {
                  color: '#6b7280',
                },
              },
            }}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('SignUp' as never)}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: width * 0.9,
    alignSelf: 'center',
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default SignInScreen;
