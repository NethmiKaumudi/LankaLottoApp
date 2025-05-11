import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { commonStyles } from '../styles/commonStyles';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    agent_name: global.agentName || '', // Use global variable as initial value
    nlb_dlb_no: global.agentNo || '',   // Use global variable as initial value
    contact_no: '',
    address: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://192.168.8.152:5000/users/profile', {
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile({
          agent_name: data.Agent_Name || global.agentName || '',
          nlb_dlb_no: data.NLB_DLB_No || global.agentNo || '',
          contact_no: data.Contact_No || '',
          address: data.Address || '',
        });
        setNewAddress(data.Address || '');
      } else {
        Alert.alert('Error', data.message);
        // Fallback to global variables if fetch fails
        setProfile({
          agent_name: global.agentName || '',
          nlb_dlb_no: global.agentNo || '',
          contact_no: '',
          address: '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to fetch profile.');
      // Fallback to global variables if fetch fails
      setProfile({
        agent_name: global.agentName || '',
        nlb_dlb_no: global.agentNo || '',
        contact_no: '',
        address: '',
      });
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.8.152:5000/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${global.authToken}`
        },
        body: JSON.stringify({
          password: newPassword,
          address: newAddress,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setProfile({ ...profile, address: newAddress });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#4169E1']}
      style={commonStyles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Agent Name:</Text>
          <Text style={styles.value}>{profile.agent_name}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>NLB/DLB No:</Text>
          <Text style={styles.value}>{profile.nlb_dlb_no}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Contact No:</Text>
          <Text style={styles.value}>{profile.contact_no}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Address:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="Enter new address"
            />
          ) : (
            <Text style={styles.value}>{profile.address}</Text>
          )}
        </View>
        {isEditing && (
          <View style={styles.detailContainer}>
            <Text style={styles.label}>New Password:</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>
        )}
        <TouchableOpacity
          onPress={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
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
              {isLoading ? 'Updating...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    color: '#000',
    backgroundColor: '#fff',
  },
});

export default ProfileScreen;