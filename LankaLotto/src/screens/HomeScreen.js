import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false); // ✅ Moved inside the component

  const handleCameraPress = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };

    // Test server connectivity
    const BASE_URL = 'http://192.168.8.152:5000'; // Adjust if needed
    axios.get(BASE_URL)
      .then(response => {
        console.log('Backend test response:', response.data);
      })
      .catch(error => {
        console.log('Backend connectivity error:', error.message);
        Alert.alert('Error', 'Cannot connect to the server. Please ensure the server is running.');
        return;
      });

    launchCamera(options, async (response) => {
      console.log('Camera response:', response);
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera error:', response.errorCode, response.errorMessage);
        Alert.alert('Error', response.errorMessage);
      } else {
        setIsLoading(true); // Set loading state
        const image = response.assets[0];
        console.log('Captured image:', image);

        // Adjust URI for Android if necessary
        const uri = Platform.OS === 'android' && !image.uri.startsWith('file://')
          ? `file://${image.uri}`
          : image.uri;

        const formData = new FormData();
        formData.append('image', {
          uri: uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'ticket.jpg',
        });

        console.log('FormData image:', {
          uri: uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'ticket.jpg',
        });

        try {
          // Send image to backend
          const uploadResponse = await axios.post(
            `${BASE_URL}/lottery/upload-image`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          console.log('Upload response:', uploadResponse.data);
          const { image_id } = uploadResponse.data;

          // Navigate to LotteryResultsScreen immediately with image_id
          navigation.navigate('LotteryResults', { imageId: image_id });
        } catch (error) {
          console.log('Error uploading image:', {
            message: error.message,
            response: error.response ? error.response.data : 'No response',
            status: error.response ? error.response.status : 'No status',
            headers: error.response ? error.response.headers : 'No headers',
          });
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setIsLoading(false); // Reset loading state
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text style={styles.loadingText}>Uploading...</Text>
      ) : (
        <>
          <Text style={styles.title}>Welcome to LankaLotto</Text>
          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress} disabled={isLoading}>
            <Ionicons name="camera" size={50} color="white" />
            <Text style={styles.buttonText}>Scan Lottery Ticket</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4169E1',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#4169E1',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#4169E1',
  },
});

export default HomeScreen;