import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useUser } from '@clerk/clerk-react';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { apiEndpoints } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    state: '',
    occupation: '',
  });

  // Fetch existing profile
  const {
    data: profile,
    isLoading: fetching,
    error,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => apiEndpoints.profile.get(user?.id || ''),
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiEndpoints.profile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      Alert.alert('Success', 'Profile saved successfully!');
      navigation.navigate('Dashboard' as never);
    },
    onError: (error) => {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (profile?.has_profile && profile.profile) {
      setFormData({
        name: profile.profile.name || '',
        gender: profile.profile.gender || '',
        state: profile.profile.state || '',
        occupation: profile.profile.occupation || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit.');
      return;
    }

    const payload = {
      clerk_user_id: user.id,
      ...formData,
    };

    updateProfileMutation.mutate(payload);
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const occupations = [
    'Farmer', 'Business Owner', 'Employee', 'Student', 'Professional',
    'Self Employed', 'Other'
  ];

  if (fetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Information</Text>
          <Text style={styles.subtitle}>
            Update your personal information to get started
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            autoCapitalize="words"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>State</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.state}
                onValueChange={(value) => handleChange('state', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select state" value="" />
                {states.map((state) => (
                  <Picker.Item key={state} label={state} value={state} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.occupation}
                onValueChange={(value) => handleChange('occupation', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select occupation" value="" />
                {occupations.map((occupation) => (
                  <Picker.Item key={occupation} label={occupation} value={occupation} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit}
              loading={updateProfileMutation.isPending}
              disabled={updateProfileMutation.isPending}
              style={styles.submitButton}
            >
              Save Profile
            </Button>
          </View>
        </Card>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formCard: {
    margin: 20,
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    color: '#111827',
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;
