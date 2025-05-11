import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomTextInput from '../../components/CustomTextInput';
import { commonStyles } from '../../styles/commonStyles';

const SignupScreen = ({ navigation }) => {
  const [agentName, setAgentName] = useState('');
  const [nlbDlbNo, setNlbDlbNo] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to format the mobile number with country code
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

  const handleRegister = async () => {
    const formattedNumber = formatMobileNumber(mobileNumber);
    setMobileNumber(formattedNumber); // Update the text field to show the formatted number
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.8.152:5000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_name: agentName,
          nlb_dlb_no: nlbDlbNo,
          contact_no: formattedNumber, // Send the formatted number
          address: address,
          password: password,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        Alert.alert('Success', data.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to register. Please try again.');
      console.error(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={commonStyles.cardContainer}>
              <View style={styles.userIconContainer}>
                <View style={styles.userIcon}>
                  <Image
                    source={require('../../assets/images/user_edit_icon.png')}
                    style={styles.userIconImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text style={styles.signupTitle}>Create Your Account</Text>
              <CustomTextInput
                label="Agent Name"
                value={agentName}
                onChangeText={setAgentName}
                placeholder=""
              />
              <CustomTextInput
                label="NLB / DLB No"
                value={nlbDlbNo}
                onChangeText={setNlbDlbNo}
                placeholder=""
              />
              <CustomTextInput
                label="Mobile Number"
                value={mobileNumber}
                onChangeText={handleMobileNumberChange}
                keyboardType="phone-pad"
                placeholder=""
              />
              <CustomTextInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder=""
              />
              <CustomTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                placeholder=""
              />
              <TouchableOpacity
                onPress={handleRegister}
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
                    {isLoading ? 'Registering...' : 'Register'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.loginContainer}>
                <Text style={styles.haveAccountText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={commonStyles.linkText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  userIconContainer: {
    marginTop: 20,
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconImage: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  signupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#000',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  haveAccountText: {
    fontSize: 14,
    color: '#000',
  },
});

export default SignupScreen;