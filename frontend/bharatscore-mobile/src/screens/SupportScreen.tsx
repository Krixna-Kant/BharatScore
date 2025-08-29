import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const SupportScreen: React.FC = () => {
  const supportOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'help',
      action: () => {
        // Navigate to FAQ screen or show FAQ modal
        console.log('Navigate to FAQ');
      },
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get in touch with our support team',
      icon: 'support-agent',
      action: () => {
        Linking.openURL('mailto:support@bharatscore.com');
      },
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: 'chat',
      action: () => {
        // Open live chat or show chat interface
        console.log('Open live chat');
      },
    },
    {
      id: 'call',
      title: 'Call Support',
      description: 'Speak directly with our team',
      icon: 'phone',
      action: () => {
        Linking.openURL('tel:+91-1800-123-4567');
      },
    },
  ];

  const quickLinks = [
    {
      title: 'How to apply for a loan',
      url: 'https://bharatscore.com/loan-guide',
    },
    {
      title: 'Understanding Bharat Score',
      url: 'https://bharatscore.com/score-guide',
    },
    {
      title: 'Privacy Policy',
      url: 'https://bharatscore.com/privacy',
    },
    {
      title: 'Terms of Service',
      url: 'https://bharatscore.com/terms',
    },
  ];

  const renderSupportOption = (option: any) => (
    <TouchableOpacity key={option.id} onPress={option.action}>
      <Card style={styles.supportCard}>
        <View style={styles.supportCardContent}>
          <MaterialIcons name={option.icon as any} size={32} color="#2563eb" />
          <View style={styles.supportCardText}>
            <Text style={styles.supportCardTitle}>{option.title}</Text>
            <Text style={styles.supportCardDescription}>{option.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderQuickLink = (link: any, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => Linking.openURL(link.url)}
      style={styles.quickLink}
    >
      <Text style={styles.quickLinkText}>{link.title}</Text>
      <MaterialIcons name="open-in-new" size={16} color="#2563eb" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Support & Help</Text>
        <Text style={styles.subtitle}>We're here to help you succeed</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          {supportOptions.map(renderSupportOption)}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Card style={styles.quickLinksCard}>
            {quickLinks.map(renderQuickLink)}
          </Card>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card style={styles.contactCard}>
            <View style={styles.contactItem}>
              <MaterialIcons name="email" size={20} color="#6b7280" />
              <Text style={styles.contactText}>support@bharatscore.com</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="phone" size={20} color="#6b7280" />
              <Text style={styles.contactText}>+91-1800-123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="schedule" size={20} color="#6b7280" />
              <Text style={styles.contactText}>24/7 Support Available</Text>
            </View>
          </Card>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Help us improve</Text>
            <Text style={styles.feedbackDescription}>
              Your feedback helps us provide better service
            </Text>
            <Button
              variant="outline"
              onPress={() => {
                // Open feedback form or navigate to feedback screen
                console.log('Open feedback form');
              }}
              style={styles.feedbackButton}
            >
              Send Feedback
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginTop: 8,
  },
  supportCard: {
    marginBottom: 12,
    padding: 16,
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportCardText: {
    flex: 1,
    marginLeft: 16,
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  supportCardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  quickLinksCard: {
    padding: 16,
  },
  quickLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quickLinkText: {
    fontSize: 14,
    color: '#2563eb',
    flex: 1,
  },
  contactCard: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  feedbackSection: {
    alignItems: 'center',
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  feedbackButton: {
    minWidth: 120,
  },
});

export default SupportScreen;
