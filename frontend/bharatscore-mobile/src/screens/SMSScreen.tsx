import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import SMSService, { SMSMessage } from '../services/smsService';
import { formatDistanceToNow } from 'date-fns';

const SMSScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch SMS messages
  const {
    data: smsMessages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sms-messages'],
    queryFn: () => SMSService.getRecentSMS(100),
    enabled: false, // Don't auto-fetch, require user permission first
  });

  // Fetch SMS count
  const {
    data: smsCount,
    isLoading: countLoading,
  } = useQuery({
    queryKey: ['sms-count'],
    queryFn: () => SMSService.getSMSCount(),
    enabled: false,
  });

  useEffect(() => {
    // Request permission when component mounts
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const hasPermission = await SMSService.requestSMSPermission();
      if (hasPermission) {
        refetch();
      }
    } catch (error) {
      Alert.alert(
        'Permission Required',
        'SMS permission is required to read messages and calculate your Bharat Score.',
        [{ text: 'OK' }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing SMS:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      refetch();
      return;
    }

    try {
      const searchResults = await SMSService.searchSMSByKeyword(searchQuery);
      // Update the query data with search results
      // This is a simplified approach - in a real app you might want to use a separate state
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search SMS messages');
    }
  };

  const renderSMSItem = ({ item }: { item: SMSMessage }) => (
    <TouchableOpacity style={styles.smsItem}>
      <View style={styles.smsHeader}>
        <Text style={styles.smsAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={styles.smsDate}>
          {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
        </Text>
      </View>
      <Text style={styles.smsBody} numberOfLines={3}>
        {item.body}
      </Text>
      <View style={styles.smsFooter}>
        <View style={[styles.readIndicator, { backgroundColor: item.read ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.readText}>{item.read ? 'Read' : 'Unread'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="sms" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No SMS Messages</Text>
      <Text style={styles.emptyStateSubtitle}>
        {error ? 'Failed to load messages' : 'Grant permission to read SMS messages'}
      </Text>
      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && !smsMessages) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading SMS messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SMS Messages</Text>
        {smsCount !== undefined && (
          <Text style={styles.countText}>{smsCount} messages</Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <FlatList
        data={smsMessages || []}
        renderItem={renderSMSItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={requestPermission}>
        <MaterialIcons name="refresh" size={24} color="white" />
      </TouchableOpacity>
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
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButton: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  smsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smsAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  smsDate: {
    fontSize: 12,
    color: '#666',
  },
  smsBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  smsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SMSScreen;
