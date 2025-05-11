import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ForgotPasswordScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    // Basic validation
    if (!mobileNumber || mobileNumber.trim().length < 9) {
      alert('Please enter a valid mobile number');
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Comment: API call would go here for password reset request
    setTimeout(() => {
      setIsLoading(false);
      // Comment: Here would be the password reset logic with API
      
      // Navigate to Reset Password screen
      navigation.navigate('ResetPassword');
    }, 1500);
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#4169E1']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <View style={styles.cardContainer}>
            {/* Question Mark Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            </View>

            {/* Reset Password Title */}
            <Text style={styles.title}>It's Ok Reset Your Password</Text>

            {/* Mobile Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Your Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                placeholder=""
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isLoading}
              style={styles.continueButtonContainer}
            >
              <LinearGradient
                colors={['#E6E6FA', '#4169E1']}
                style={styles.continueButton}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? 'Processing...' : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    height:'95%',
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#000',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginTop: 20,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    color: '#000',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#000',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  continueButtonContainer: {
    width: '60%',
    height: 50,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  continueButton: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;