import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-react';

const { width } = Dimensions.get('window');

const CustomDrawerContent: React.FC<any> = (props) => {
  const { user } = useUser();

  const drawerItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: 'MainTabs',
    },
    {
      label: 'Psychometric Test',
      icon: 'psychology',
      route: 'PsychometricTest',
    },
    {
      label: 'Applications',
      icon: 'assignment',
      route: 'Applications',
    },
    {
      label: 'Support',
      icon: 'help',
      route: 'Support',
    },
    {
      label: 'Admin Dashboard',
      icon: 'admin-panel-settings',
      route: 'AdminDashboard',
    },
  ];

  const handleNavigation = (routeName: string) => {
    props.navigation.navigate(routeName);
    props.navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={32} color="#2563eb" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.firstName || 'User'} {user?.lastName || ''}
            </Text>
            <Text style={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        <View style={styles.drawerItems}>
          {drawerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={() => handleNavigation(item.route)}
            >
              <MaterialIcons name={item.icon as any} size={24} color="#374151" />
              <Text style={styles.drawerItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            // Handle sign out
            console.log('Sign out');
          }}
        >
          <MaterialIcons name="logout" size={24} color="#dc2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  drawerContent: {
    flex: 1,
  },
  drawerItems: {
    paddingTop: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 16,
    color: '#dc2626',
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default CustomDrawerContent;
