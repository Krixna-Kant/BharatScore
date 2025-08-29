import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/ui/Card';

const { width } = Dimensions.get('window');

// Mock data for applications
const mockApplications = [
  {
    id: 'APP001',
    loanType: 'Personal Loan',
    amount: '₹2,50,000',
    status: 'approved',
    appliedDate: '2024-01-15',
    bharatScore: 720,
  },
  {
    id: 'APP002',
    loanType: 'Education Loan',
    amount: '₹8,00,000',
    status: 'pending',
    appliedDate: '2024-01-20',
    bharatScore: 685,
  },
  {
    id: 'APP003',
    loanType: 'Business Loan',
    amount: '₹15,00,000',
    status: 'rejected',
    appliedDate: '2024-01-10',
    bharatScore: 545,
  },
];

const ApplicationsScreen: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <MaterialIcons name="check-circle" size={20} color="#10b981" />;
      case 'pending':
        return <MaterialIcons name="schedule" size={20} color="#f59e0b" />;
      case 'rejected':
        return <MaterialIcons name="cancel" size={20} color="#ef4444" />;
      default:
        return <MaterialIcons name="description" size={20} color="#6b7280" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'approved':
          return { backgroundColor: '#10b981', color: 'white' };
        case 'pending':
          return { backgroundColor: '#f59e0b', color: 'white' };
        case 'rejected':
          return { backgroundColor: '#ef4444', color: 'white' };
        default:
          return { backgroundColor: '#6b7280', color: 'white' };
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'approved':
          return 'Approved';
        case 'pending':
          return 'Under Review';
        case 'rejected':
          return 'Rejected';
        default:
          return status;
      }
    };

    return (
      <View style={[styles.statusBadge, getStatusStyle()]}>
        <Text style={[styles.statusText, { color: getStatusStyle().color }]}>
          {getStatusText()}
        </Text>
      </View>
    );
  };

  const renderApplicationCard = (app: any) => (
    <Card key={app.id} style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {getStatusIcon(app.status)}
          <View style={styles.appInfo}>
            <Text style={styles.loanType}>{app.loanType}</Text>
            <Text style={styles.appId}>Application ID: {app.id}</Text>
          </View>
        </View>
        {getStatusBadge(app.status)}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loan Amount</Text>
            <Text style={styles.infoValue}>{app.amount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Applied Date</Text>
            <Text style={styles.infoValue}>{app.appliedDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bharat Score</Text>
            <Text style={styles.infoValue}>{app.bharatScore}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loan Applications</Text>
        <Text style={styles.subtitle}>Track the status of your loan applications</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {mockApplications.map(renderApplicationCard)}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  applicationCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appInfo: {
    marginLeft: 12,
    flex: 1,
  },
  loanType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appId: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});

export default ApplicationsScreen;
