import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomTextInput from '../../components/CustomTextInput';
import { commonStyles } from '../../styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const formatMobileNumber = (number) => {
    let cleanedNumber = number.replace(/[^0-9+]/g, '');
    if (cleanedNumber.startsWith('+94')) {
      return cleanedNumber;
    }
    if (cleanedNumber.startsWith('0')) {
      cleanedNumber = cleanedNumber.substring(1);
    }
    return `+94${cleanedNumber}`;
  };

  const handleMobileNumberChange = (text) => {
    setMobileNumber(text);
  };

  const handleRequestOtp = async () => {
    const formattedNumber = formatMobileNumber(mobileNumber);
    setMobileNumber(formattedNumber);
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.8.152:5000/users/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_no: formattedNumber,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setShowOtpInput(true);
        setResendTimer(300);
        setCanResend(false);
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to request OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    const formattedNumber = formatMobileNumber(mobileNumber);
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.8.152:5000/users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_no: formattedNumber,
          otp: otp,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        global.authToken = data.token;

        // Fetch user details using contact_no as a query parameter
        const userResponse = await fetch(`http://192.168.8.152:5000/users/me?contact_no=${encodeURIComponent(formattedNumber)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const userData = await userResponse.json();
        if (userResponse.ok) {
          global.agentId = userData.agent_id;
          global.agentName = userData.name;
          global.agentNo = userData.nlb_no || userData.dlb_no || 'Unknown';

          await AsyncStorage.setItem('agentId', userData.agent_id);
        await AsyncStorage.setItem('agentName', userData.name);
        await AsyncStorage.setItem('agentNo', userData.nlb_no || userData.dlb_no || 'Unknown');
          navigation.navigate('Main');
        } else {
          Alert.alert('Error', userData.message || 'Failed to fetch user details');
        }
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to verify OTP or fetch user details. Please try again.');
    }
  };

  useEffect(() => {
    let timer;
    if (showOtpInput && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpInput, resendTimer]);

  return (
    <LinearGradient
      colors={['#E6E6FA', '#4169E1']}
      style={commonStyles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={commonStyles.safeAreaContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={commonStyles.keyboardAvoidingContainer}
        >
          <View style={commonStyles.cardContainer}>
            <View style={styles.userIconContainer}>
              <View style={styles.userIcon}>
                <Image
                  source={require('../../assets/images/user_icon.png')}
                  style={styles.userIconImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.loginTitle}>Login</Text>
            <Text style={styles.loginSubtitle}>Please Sign In to continue</Text>
            <CustomTextInput
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              keyboardType="phone-pad"
              placeholder=""
            />
            {showOtpInput && (
              <>
                <CustomTextInput
                  label="OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  placeholder=""
                />
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    {canResend ? 'Didn\'t receive OTP? ' : `Resend available in ${resendTimer}s `}
                  </Text>
                  {canResend && (
                    <TouchableOpacity onPress={handleRequestOtp}>
                      <Text style={commonStyles.linkText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={commonStyles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={showOtpInput ? handleVerifyOtp : handleRequestOtp}
              disabled={isLoading}
              style={commonStyles.gradientButton}
            >
              <LinearGradient
                colors={['#E6E6FA', '#4169E1']}
                style={commonStyles.gradientButtonInner}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={commonStyles.gradientButtonText}>
                  {isLoading ? (showOtpInput ? 'Verifying...' : 'Requesting OTP...') : (showOtpInput ? 'Verify OTP' : 'Request OTP')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.signupContainer}>
              <Text style={styles.noAccountText}>Don't have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={commonStyles.linkText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  userIconContainer: {
    marginTop: 20,
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconImage: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#000',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 30,
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  noAccountText: {
    fontSize: 14,
    color: '#000',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
});

export default LoginScreen;