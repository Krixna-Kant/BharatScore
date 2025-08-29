import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiEndpoints } from '../services/api';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const RedirectorScreen: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => apiEndpoints.profile.get(user?.id || ''),
    enabled: !!isSignedIn && !!user?.id,
  });

  useEffect(() => {
    const handleRedirection = async () => {
      // If not signed in, redirect to sign-in
      if (!isSignedIn || !user) {
        navigation.navigate('SignIn' as never);
        return;
      }

      try {
        // Check if user has a profile
        if (profile?.has_profile) {
          console.log('User has profile, redirecting to dashboard');
          navigation.navigate('MainApp' as never);
        } else {
          console.log('User has no profile, redirecting to profile form');
          navigation.navigate('MainApp' as never);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setError('Failed to check user profile');
        navigation.navigate('MainApp' as never);
      } finally {
        setLoading(false);
      }
    };

    if (!profileLoading) {
      handleRedirection();
    }
  }, [isSignedIn, user, profile, profileLoading, navigation]);

  if (loading || profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Setting up your account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Error: {error || 'Failed to load profile'}</Text>
          <Button
            onPress={() => navigation.navigate('MainApp' as never)}
            style={styles.continueButton}
          >
            Continue to Profile
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 24,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 24,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});

export default RedirectorScreen;
