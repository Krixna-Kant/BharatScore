import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiEndpoints } from '../services/api';
import { useUser } from '@clerk/clerk-react';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => apiEndpoints.profile.get(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch user score
  const {
    data: score,
    isLoading: scoreLoading,
    refetch: refetchScore,
  } = useQuery({
    queryKey: ['score', user?.id],
    queryFn: () => apiEndpoints.score.get(user?.id || ''),
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchScore()]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderScoreCard = () => (
    <View style={styles.scoreCard}>
      <View style={styles.scoreHeader}>
        <MaterialIcons name="star" size={24} color="#FFD700" />
        <Text style={styles.scoreTitle}>Your Bharat Score</Text>
      </View>
      {scoreLoading ? (
        <Text style={styles.loadingText}>Loading score...</Text>
      ) : score ? (
        <View style={styles.scoreContent}>
          <Text style={styles.scoreValue}>{score.score || 'N/A'}</Text>
          <Text style={styles.scoreLabel}>out of 1000</Text>
          <Text style={styles.scoreDescription}>
            {score.score >= 700 ? 'Excellent' : 
             score.score >= 500 ? 'Good' : 
             score.score >= 300 ? 'Fair' : 'Poor'}
          </Text>
        </View>
      ) : (
        <Text style={styles.noScoreText}>No score available</Text>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Apply' as never)}
        >
          <MaterialIcons name="assignment" size={32} color="#2563eb" />
          <Text style={styles.actionText}>Apply Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <MaterialIcons name="person" size={32} color="#2563eb" />
          <Text style={styles.actionText}>Update Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SMS' as never)}
        >
          <MaterialIcons name="sms" size={32} color="#2563eb" />
          <Text style={styles.actionText}>SMS Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PsychometricTest' as never)}
        >
          <MaterialIcons name="psychology" size={32} color="#2563eb" />
          <Text style={styles.actionText}>Take Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <Text style={styles.sectionTitle}>Profile Status</Text>
      <View style={styles.profileCard}>
        {profileLoading ? (
          <Text style={styles.loadingText}>Loading profile...</Text>
        ) : profile?.has_profile ? (
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.profile.name}</Text>
            <Text style={styles.profileDetails}>
              {profile.profile.occupation} • {profile.profile.state}
            </Text>
            <View style={styles.completionStatus}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.completionText}>Profile Complete</Text>
            </View>
          </View>
        ) : (
          <View style={styles.incompleteProfile}>
            <MaterialIcons name="warning" size={24} color="#FF9800" />
            <Text style={styles.incompleteText}>Profile Incomplete</Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {profile?.profile?.name || 'User'}!
          </Text>
          <Text style={styles.subtitle}>
            Track your Bharat Score and financial health
          </Text>
        </View>

        {renderScoreCard()}
        {renderProfileSection()}
        {renderQuickActions()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scoreCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  noScoreText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  profileSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  profileDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  incompleteProfile: {
    alignItems: 'center',
  },
  incompleteText: {
    fontSize: 16,
    color: '#FF9800',
    marginVertical: 8,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
