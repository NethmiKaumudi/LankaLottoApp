import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomTextInput from '../components/CustomTextInput';
import { commonStyles } from '../styles/commonStyles';

const SalesManagementEdit = ({ route, navigation }) => {
  const { salesItem } = route.params || {};

  const [date, setDate] = useState(salesItem?.date_of_sale || '');
  const [province, setProvince] = useState(salesItem?.province || '');
  const [district, setDistrict] = useState(salesItem?.district || '');
  const [area, setArea] = useState(salesItem?.area || '');
  const [dlbSales, setDlbSales] = useState(salesItem?.dlb_sale?.toString() || '0');
  const [nlbSales, setNlbSales] = useState(salesItem?.nlb_sale?.toString() || '0');
  const [totalSales, setTotalSales] = useState(salesItem?.total_sale?.toString() || '0');

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const dlb = parseInt(dlbSales, 10) || 0;
    const nlb = parseInt(nlbSales, 10) || 0;
    setTotalSales((dlb + nlb).toString());
  }, [dlbSales, nlbSales]);

  useEffect(() => {
    if (!salesItem || !salesItem._id) {
      Alert.alert('Error', 'Invalid sales data. Please go back and try again.');
      navigation.goBack();
    }
  }, [salesItem, navigation]);

  const handleUpdateSales = async () => {
    if (!global.agentId) {
      Alert.alert('Error', 'Agent ID not found. Please log in again.');
      navigation.navigate('Login');
      return;
    }

    if (!date || !province.trim() || !district.trim() || !area.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    const dlb = parseInt(dlbSales, 10);
    const nlb = parseInt(nlbSales, 10);
    if (isNaN(dlb) || isNaN(nlb) || dlb < 0 || nlb < 0) {
      Alert.alert('Error', 'DLB Sales and NLB Sales must be non-negative integers');
      return;
    }
    const total = dlb + nlb;
    if (total <= 0) {
      Alert.alert('Error', 'Total Sales must be greater than zero');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
      return;
    }

    const payload = {
      agent_id: global.agentId,
      date_of_sale: date,
      province: province.trim(),
      district: district.trim(),
      area: area.trim(),
      dlb_sale: dlb,
      nlb_sale: nlb,
      total_sale: total,
    };

    console.log('Sending update payload:', payload);

    try {
      const response = await fetch(`http://192.168.8.152:5000/sales/${salesItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Sales data updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        console.log('Error response:', data);
        Alert.alert('Error', data.message || 'Failed to update sales data');
      }
    } catch (error) {
      console.error('Update sales error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#4169E1']}
      style={[commonStyles.container, { minHeight: screenHeight }]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[commonStyles.keyboardAvoidingContainer, { flex: 1 }]}>
          <View style={[commonStyles.cardContainer, styles.cardContainer]}>
            <Text style={styles.title}>Edit Sales</Text>
            <Text style={styles.agentInfoText}>
              Agent Name: {global.agentName || 'Not Available'}
            </Text>
            <Text style={styles.agentInfoText}>
              NLB/DLB No: {global.agentNo || 'Not Available'}
            </Text>
            <CustomTextInput
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
            <CustomTextInput
              label="Province"
              value={province}
              onChangeText={setProvince}
              placeholder=""
              style={styles.input}
            />
            <CustomTextInput
              label="District"
              value={district}
              onChangeText={setDistrict}
              placeholder=""
              style={styles.input}
            />
            <CustomTextInput
              label="Area"
              value={area}
              onChangeText={setArea}
              placeholder=""
              style={styles.input}
            />
            <CustomTextInput
              label="DLB Sales"
              value={dlbSales}
              onChangeText={setDlbSales}
              keyboardType="numeric"
              placeholder="0"
              style={styles.input}
            />
            <CustomTextInput
              label="NLB Sales"
              value={nlbSales}
              onChangeText={setNlbSales}
              keyboardType="numeric"
              placeholder="0"
              style={styles.input}
            />
            <CustomTextInput
              label="Total Sales"
              value={totalSales}
              editable={false}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateSales}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  agentInfoText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  input: {
    marginBottom: 6,
  },
  updateButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#4169E1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SalesManagementEdit;