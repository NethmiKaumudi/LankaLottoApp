import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#CCCCCC', '#4169E1']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome To</Text>
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/lankalotto_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          
          <Text style={styles.poweredByText}>Powered by Lanka Lotto</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.1,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: height * 0.05,
  },
  logoContainer: {
    width: width * 0.8,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: height * 0.05,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  getStartedButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: height * 0.1,
  },
  getStartedText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#000000',
  },
  poweredByText: {
    fontSize: 24,
    fontStyle: 'italic',
    color: '#000000',
    position: 'absolute',
    bottom: 30,
    fontWeight: 'bold'
  },
});

export default WelcomeScreen;