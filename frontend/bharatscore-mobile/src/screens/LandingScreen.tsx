import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

const LandingScreen: React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/farmer-logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Main Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.highlight}>BharatScore</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Fast, simple and reliable way to get started.
          </Text>
        </View>
        
        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Button
            size="lg"
            onPress={() => navigation.navigate('Redirector' as never)}
          >
            Get Started
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7', // Light orange background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 200,
    maxHeight: 200,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: Math.min(width * 0.08, 40),
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Math.min(width * 0.1, 48),
  },
  highlight: {
    color: '#000000',
  },
  subtitle: {
    fontSize: Math.min(width * 0.05, 20),
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.06, 28),
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});

export default LandingScreen;
