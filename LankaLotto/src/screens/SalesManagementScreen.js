import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomTextInput from '../components/CustomTextInput';
import { commonStyles } from '../styles/commonStyles';

const SalesManagementScreen = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [dlbSales, setDlbSales] = useState('');
  const [nlbSales, setNlbSales] = useState('');
  const [totalSales, setTotalSales] = useState('');

  const screenHeight = Dimensions.get('window').height;

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setDate(getTodayDate());
    const dlb = parseInt(dlbSales, 10) || 0;
    const nlb = parseInt(nlbSales, 10) || 0;
    setTotalSales((dlb + nlb).toString());
  }, [dlbSales, nlbSales]);

  const handleAddSales = async () => {
    if (!global.agentId) {
      Alert.alert('Error', 'Agent ID not found. Please log in again.');
      navigation.navigate('Login');
      return;
    }

    if (!province.trim() || !district.trim() || !area.trim()) {
      Alert.alert('Error', 'Province, District, and Area cannot be empty');
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

    console.log('Sending payload:', payload);

    try {
      const response = await fetch('http://192.168.8.152:5000/sales/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Sales data saved successfully');
        setDate(getTodayDate());
        setProvince('');
        setDistrict('');
        setArea('');
        setDlbSales('');
        setNlbSales('');
        setTotalSales('');
      } else {
        console.log('Error response:', data);
        Alert.alert('Error', data.message || 'Failed to save sales data');
      }
    } catch (error) {
      console.error('Request error:', error);
      Alert.alert('Error', 'Failed to save sales data. Please check your network.');
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
            <Text style={styles.title}>Add Sales</Text>
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
              placeholder=""
              style={styles.input}
            />
            <CustomTextInput
              label="NLB Sales"
              value={nlbSales}
              onChangeText={setNlbSales}
              keyboardType="numeric"
              placeholder=""
              style={styles.input}
            />
            <CustomTextInput
              label="Total Sales"
              value={totalSales}
              editable={false}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddSales}
            >
              <Text style={styles.addButtonText}>Add Sales</Text>
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
    padding: 15, // Reduced padding for compact layout
  },
  title: {
    fontSize: 24, // Slightly larger for emphasis
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  agentInfoText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    marginBottom: 10, // Adjusted spacing between inputs
  },
  addButton: {
    width: '80%',
    height: 45, // Slightly taller button
    backgroundColor: '#4169E1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SalesManagementScreen;