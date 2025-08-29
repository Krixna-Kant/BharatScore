import React, { useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { apiEndpoints } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const { width } = Dimensions.get('window');

const ApplyScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState({
    phoneType: '',
    region: '',
    smsCount: '',
    billHabit: '',
    rechargeHabit: '',
    simTenure: '',
    locationStability: '',
    income: '',
    steadyJob: '',
    fixedSalary: '',
    coopScore: '',
    landVerified: '',
    age: '',
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: (data: any) => apiEndpoints.onboarding.submit(data),
    onSuccess: () => {
      Alert.alert('Success', 'Application submitted successfully!');
      navigation.navigate('Dashboard' as never);
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application');
    },
  });

  const mapToModel = () => {
    let bill_on_time_ratio = 0.5;
    if (formData.billHabit === 'always') bill_on_time_ratio = 0.95;
    else if (formData.billHabit === 'most') bill_on_time_ratio = 0.8;
    else if (formData.billHabit === 'sometimes') bill_on_time_ratio = 0.5;
    else if (formData.billHabit === 'rarely') bill_on_time_ratio = 0.2;

    let recharge_freq = 1;
    if (formData.rechargeHabit === 'always') recharge_freq = 3;
    else if (formData.rechargeHabit === 'sometimes') recharge_freq = 2;
    else recharge_freq = 1;

    let sim_tenure = 6;
    if (formData.simTenure === 'lt6') sim_tenure = 3;
    else if (formData.simTenure === '6to12') sim_tenure = 9;
    else if (formData.simTenure === '1to3') sim_tenure = 24;
    else if (formData.simTenure === '3plus') sim_tenure = 48;

    let location_stability = 0.6;
    if (formData.locationStability === 'rarely') location_stability = 0.9;
    else if (formData.locationStability === 'occasionally') location_stability = 0.6;
    else if (formData.locationStability === 'frequently') location_stability = 0.3;

    let income_signal = 0.3;
    if (formData.income === 'high' && formData.steadyJob === 'yes' && formData.fixedSalary === 'yes')
      income_signal = 0.9;
    else if (formData.income === 'medium' && formData.steadyJob === 'yes')
      income_signal = 0.7;
    else if (formData.income === 'low') income_signal = 0.4;

    const coop_score = parseFloat(formData.coopScore) / 100;
    const land_verified = formData.landVerified === 'yes' ? 1 : 0;

    let age_group = '18-25';
    const ageNum = parseInt(formData.age);
    if (ageNum >= 18 && ageNum <= 25) age_group = '18-25';
    else if (ageNum >= 26 && ageNum <= 35) age_group = '26-35';
    else if (ageNum >= 36 && ageNum <= 50) age_group = '36-50';
    else if (ageNum > 50) age_group = '50+';

    return {
      clerk_user_id: user?.id,
      user_type: formData.phoneType,
      region: formData.region,
      sms_count: Number(formData.smsCount),
      bill_on_time_ratio,
      recharge_freq,
      sim_tenure,
      location_stability,
      income_signal,
      coop_score,
      land_verified,
      age_group,
    };
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    const payload = mapToModel();
    submitApplicationMutation.mutate(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderPicker = (label: string, field: string, options: Array<{label: string, value: string}>) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={formData[field as keyof typeof formData]}
          onValueChange={(value) => handleChange(field, value)}
          style={styles.picker}
        >
          <Picker.Item label={`Select ${label.toLowerCase()}`} value="" />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Loan Application</Text>
          <Text style={styles.subtitle}>
            Fill in your details to apply for a loan
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderPicker('Phone Type', 'phoneType', [
            { label: 'Feature Phone', value: 'feature' },
            { label: 'Smartphone', value: 'smartphone' },
          ])}

          {renderPicker('Region', 'region', [
            { label: 'North', value: 'north' },
            { label: 'South', value: 'south' },
            { label: 'East', value: 'east' },
            { label: 'West', value: 'west' },
            { label: 'Central', value: 'central' },
          ])}

          <Input
            label="SMS Count (per month)"
            placeholder="Enter average SMS count"
            value={formData.smsCount}
            onChangeText={(value) => handleChange('smsCount', value)}
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Financial Behavior</Text>

          {renderPicker('Bill Payment Habit', 'billHabit', [
            { label: 'Always on time', value: 'always' },
            { label: 'Mostly on time', value: 'most' },
            { label: 'Sometimes late', value: 'sometimes' },
            { label: 'Rarely on time', value: 'rarely' },
          ])}

          {renderPicker('Recharge Habit', 'rechargeHabit', [
            { label: 'Always recharge', value: 'always' },
            { label: 'Sometimes recharge', value: 'sometimes' },
            { label: 'Rarely recharge', value: 'rarely' },
          ])}

          {renderPicker('SIM Tenure', 'simTenure', [
            { label: 'Less than 6 months', value: 'lt6' },
            { label: '6-12 months', value: '6to12' },
            { label: '1-3 years', value: '1to3' },
            { label: '3+ years', value: '3plus' },
          ])}

          {renderPicker('Location Stability', 'locationStability', [
            { label: 'Rarely move', value: 'rarely' },
            { label: 'Occasionally move', value: 'occasionally' },
            { label: 'Frequently move', value: 'frequently' },
          ])}

          <Text style={styles.sectionTitle}>Income & Employment</Text>

          {renderPicker('Income Level', 'income', [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
          ])}

          {renderPicker('Steady Job', 'steadyJob', [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ])}

          {renderPicker('Fixed Salary', 'fixedSalary', [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ])}

          <Text style={styles.sectionTitle}>Additional Information</Text>

          <Input
            label="Cooperation Score (0-100)"
            placeholder="Enter your cooperation score"
            value={formData.coopScore}
            onChangeText={(value) => handleChange('coopScore', value)}
            keyboardType="numeric"
          />

          {renderPicker('Land Verified', 'landVerified', [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ])}

          <Input
            label="Age"
            placeholder="Enter your age"
            value={formData.age}
            onChangeText={(value) => handleChange('age', value)}
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit}
              loading={submitApplicationMutation.isPending}
              disabled={submitApplicationMutation.isPending}
              style={styles.submitButton}
            >
              Submit Application
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
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
    marginTop: 32,
  },
  submitButton: {
    width: '100%',
  },
});

export default ApplyScreen;
