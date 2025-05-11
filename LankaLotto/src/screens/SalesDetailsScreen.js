import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import CustomTextInput from '../components/CustomTextInput';
import { commonStyles } from '../styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SalesDetailsScreen = ({ navigation }) => {
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [chartType, setChartType] = useState('total_sale');
  const [hasSalesData, setHasSalesData] = useState(true);
  const [hasChartData, setHasChartData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSalesData();
    fetchChartData();
  }, [chartType]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSalesData(salesData);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = salesData.filter((item) =>
        item.date_of_sale?.toLowerCase().includes(lowerQuery) ||
        item.dlb_sale?.toString().includes(lowerQuery) ||
        item.nlb_sale?.toString().includes(lowerQuery) ||
        item.total_sale?.toString().includes(lowerQuery)
      );
      setFilteredSalesData(filtered);
    }
  }, [searchQuery, salesData]);

  const fetchSalesData = async () => {
    try {
      const token = global.authToken || (await AsyncStorage.getItem('authToken'));
      const agentId = global.agentId || (await AsyncStorage.getItem('agentId'));
      const response = await fetch(`http://192.168.8.152:5000/sales/agent?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          setHasSalesData(false);
          setSalesData([]);
          setFilteredSalesData([]);
        } else {
          setSalesData(data);
          setFilteredSalesData(data);
          setHasSalesData(true);
        }
      } else {
        Alert.alert('Error', data.message);
        setHasSalesData(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sales data. Please try again.');
      setHasSalesData(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const token = global.authToken || (await AsyncStorage.getItem('authToken'));
      const agentId = global.agentId || (await AsyncStorage.getItem('agentId'));
      const response = await fetch(`http://192.168.8.152:5000/sales/by-date-agent?agent_id=${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          setHasChartData(false);
        } else {
          const labels = data.map(item => item._id);
          const chartDataValues = data.map(item => item[chartType]);
          setChartData({
            labels,
            datasets: [{ data: chartDataValues }],
          });
          setHasChartData(true);
        }
      } else {
        Alert.alert('Error', data.message);
        setHasChartData(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch chart data. Please try again.');
      setHasChartData(false);
    }
  };

  const handleEditSales = (salesItem) => {
    navigation.navigate('SalesManagementEdit', { salesItem });
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#4169E1']}
      style={commonStyles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={commonStyles.cardContainer}>
          <Text style={styles.title}>Sales Details</Text>
          <CustomTextInput
            label="Search by Date or Sales"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by date, DLB, NLB, or total"
            style={styles.searchInput}
          />
          {hasSalesData ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>DLB Sale</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>NLB Sale</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total Sale</Text>
                  <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Action</Text>
                </View>
                {filteredSalesData.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.5 }]} numberOfLines={1} ellipsizeMode="tail">
                      {item.date_of_sale}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                      {item.dlb_sale}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                      {item.nlb_sale}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                      {Math.round(item.total_sale)}
                    </Text>
                    <View style={[styles.actionsCell, { flex: 0.8 }]}>
                      <TouchableOpacity onPress={() => handleEditSales(item)} style={styles.actionButton}>
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>No sales data available.</Text>
          )}
          <Text style={styles.chartTitle}>Sales Analysis</Text>
          <View style={styles.chartToggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === 'total_sale' && styles.toggleButtonActive]}
              onPress={() => setChartType('total_sale')}
            >
              <Text style={styles.toggleButtonText}>Total Sales</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === 'dlb_sale' && styles.toggleButtonActive]}
              onPress={() => setChartType('dlb_sale')}
            >
              <Text style={styles.toggleButtonText}>DLB Sales</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === 'nlb_sale' && styles.toggleButtonActive]}
              onPress={() => setChartType('nlb_sale')}
            >
              <Text style={styles.toggleButtonText}>NLB Sales</Text>
            </TouchableOpacity>
          </View>
          {hasChartData && chartData.labels.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 80}
              height={220}
              chartConfig={{
                backgroundColor: '#000',
                backgroundGradientFrom: '#000',
                backgroundGradientTo: '#000',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No chart data available.</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    marginBottom: 15,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    marginBottom: 20,
    minWidth: Dimensions.get('window').width - 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4169E1',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    color: '#000',
    textAlign: 'center',
    fontSize: 14,
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E6E6FA',
    borderRadius: 5,
  },
  actionText: {
    color: '#4169E1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
  },
  chartToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#E6E6FA',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#4169E1',
  },
  toggleButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SalesDetailsScreen;