import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const AdminDashboardScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalApplications: 456,
    approvedApplications: 234,
    pendingApplications: 156,
    rejectedApplications: 66,
    averageScore: 685,
  };

  const recentActivities = [
    {
      id: '1',
      action: 'New user registration',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'registration',
    },
    {
      id: '2',
      action: 'Loan application approved',
      user: 'Jane Smith',
      time: '15 minutes ago',
      type: 'approval',
    },
    {
      id: '3',
      action: 'Score calculation completed',
      user: 'Mike Johnson',
      time: '1 hour ago',
      type: 'score',
    },
    {
      id: '4',
      action: 'Document verification',
      user: 'Sarah Wilson',
      time: '2 hours ago',
      type: 'verification',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <MaterialIcons name="person-add" size={20} color="#10b981" />;
      case 'approval':
        return <MaterialIcons name="check-circle" size={20} color="#10b981" />;
      case 'score':
        return <MaterialIcons name="star" size={20} color="#f59e0b" />;
      case 'verification':
        return <MaterialIcons name="verified" size={20} color="#3b82f6" />;
      default:
        return <MaterialIcons name="info" size={20} color="#6b7280" />;
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <Card key={title} style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <MaterialIcons name={icon as any} size={24} color="white" />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </Card>
  );

  const renderActivityItem = (activity: any) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        {getActivityIcon(activity.type)}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{activity.action}</Text>
        <Text style={styles.activityUser}>{activity.user}</Text>
      </View>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Monitor and manage BharatScore operations</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <Text style={styles.periodLabel}>Time Period:</Text>
            <View style={styles.periodButtons}>
              {['day', 'week', 'month', 'year'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>Overview Statistics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Users', stats.totalUsers, 'people', '#3b82f6')}
            {renderStatCard('Active Users', stats.activeUsers, 'person', '#10b981')}
            {renderStatCard('Applications', stats.totalApplications, 'description', '#f59e0b')}
            {renderStatCard('Avg Score', stats.averageScore, 'star', '#8b5cf6')}
          </View>

          {/* Application Status */}
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.applicationStats}>
            <View style={styles.applicationStat}>
              <Text style={styles.applicationStatValue}>{stats.approvedApplications}</Text>
              <Text style={styles.applicationStatLabel}>Approved</Text>
              <View style={[styles.applicationStatBar, { backgroundColor: '#10b981' }]} />
            </View>
            <View style={styles.applicationStat}>
              <Text style={styles.applicationStatValue}>{stats.pendingApplications}</Text>
              <Text style={styles.applicationStatLabel}>Pending</Text>
              <View style={[styles.applicationStatBar, { backgroundColor: '#f59e0b' }]} />
            </View>
            <View style={styles.applicationStat}>
              <Text style={styles.applicationStatValue}>{stats.rejectedApplications}</Text>
              <Text style={styles.applicationStatLabel}>Rejected</Text>
              <View style={[styles.applicationStatBar, { backgroundColor: '#ef4444' }]} />
            </View>
          </View>

          {/* Recent Activities */}
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Card style={styles.activitiesCard}>
            {recentActivities.map(renderActivityItem)}
          </Card>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              variant="outline"
              onPress={() => console.log('View all users')}
              style={styles.actionButton}
            >
              <MaterialIcons name="people" size={20} color="#2563eb" />
              <Text style={styles.actionButtonText}>View All Users</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => console.log('Review applications')}
              style={styles.actionButton}
            >
              <MaterialIcons name="assignment" size={20} color="#2563eb" />
              <Text style={styles.actionButtonText}>Review Applications</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => console.log('Generate reports')}
              style={styles.actionButton}
            >
              <MaterialIcons name="assessment" size={20} color="#2563eb" />
              <Text style={styles.actionButtonText}>Generate Reports</Text>
            </Button>
          </View>
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
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginRight: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  applicationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  applicationStat: {
    alignItems: 'center',
    flex: 1,
  },
  applicationStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  applicationStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  applicationStatBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  activitiesCard: {
    padding: 16,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
