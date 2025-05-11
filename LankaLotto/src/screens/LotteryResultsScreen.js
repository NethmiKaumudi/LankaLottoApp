import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';

const LotteryResultsScreen = ({ route, navigation }) => {
  const { imageId, triggerCamera } = route.params || {};
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch results when imageId is provided
  useEffect(() => {
    console.log('Received imageId:', imageId);
    if (imageId) {
      fetchResults(imageId);
    }
  }, [imageId]);

  // Handle camera trigger from "Next" button
  useEffect(() => {
    if (triggerCamera) {
      handleNextTicket();
    }
  }, [triggerCamera]);

  const fetchResults = async (id) => {
    try {
      setIsLoading(true);
      const BASE_URL = 'http://192.168.8.152:5000'; // Adjust if needed
      console.log('Fetching results for image_id:', id);
      console.log('Fetching results from:', `${BASE_URL}/lottery/process-ticket`);
      const response = await axios.post(
        `${BASE_URL}/lottery/process-ticket`,
        { image_id: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Fetch results response:', response.data);
      setResults(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('Error fetching results:', {
        message: error.message,
        response: error.response ? error.response.data : 'No response',
        status: error.response ? error.response.status : 'No status',
        headers: error.response ? error.response.headers : 'No headers',
      });
      Alert.alert('Error', 'Failed to fetch results. Please try again.');
    }
  };

  const handleNextTicket = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const image = response.assets[0];
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
          setIsLoading(true);
          const BASE_URL = 'http://192.168.8.152:5000'; // Adjust if needed
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
          await fetchResults(image_id);
        } catch (error) {
          setIsLoading(false);
          console.log('Error uploading image:', {
            message: error.message,
            response: error.response ? error.response.data : 'No response',
            status: error.response ? error.response.status : 'No status',
            headers: error.response ? error.response.headers : 'No headers',
          });
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
      }
    });
  };

  if (isLoading || !results) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Determine validation style
  const validationStyle = results.validation === "Valid" ? styles.valid : styles.invalid;

  return (
    <View style={styles.container}>
      {/* Lottery Name and Draw Date */}
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>{results.lotteryName || 'Unknown Lottery'}</Text>
        <Text style={styles.dateText}>{results.drawDate || 'Unknown Date'}</Text>
      </View>

      {/* Validation Status */}
      <View style={[styles.resultCard, validationStyle]}>
        <Text style={styles.validationText}>{results.validation || 'N/A'}</Text>
      </View>

      {/* Lottery Numbers */}
      <View style={styles.resultCard}>
        <Text style={styles.label}>Lottery Numbers</Text>
        <Text style={styles.value}>{results.lotteryNumbers || 'N/A'}</Text>
      </View>

      {/* Winning Numbers */}
      <View style={styles.resultCard}>
        <Text style={styles.label}>Winning Numbers</Text>
        <Text style={styles.value}>{results.lotteryResults || 'N/A'}</Text>
      </View>

      {/* Winning Price */}
      <View style={styles.resultCard}>
        <Text style={styles.label}>Winning Price</Text>
        <Text style={styles.value}>{results.winningPrice || 'N/A'}</Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNextTicket}>
        <Text style={styles.buttonText}>Next</Text>
        <Ionicons name="camera" size={20} color="white" style={{ marginLeft: 5 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4169E1',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4169E1',
  },
  valid: {
    backgroundColor: '#00FF00', // Green background for Valid
  },
  invalid: {
    backgroundColor: '#FF0000', // Red background for Invalid
  },
  validationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Black text for both Valid and Invalid
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#4169E1',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#4169E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  loadingText: {
    fontSize: 18,
    color: '#4169E1',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LotteryResultsScreen;