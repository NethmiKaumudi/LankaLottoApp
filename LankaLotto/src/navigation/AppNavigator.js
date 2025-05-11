import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SalesManagementScreen from '../screens/SalesManagementScreen';
import LotteryResultsScreen from '../screens/LotteryResultsScreen';
import SalesDetailsScreen from '../screens/SalesDetailsScreen';
import SalesManagementEdit from '../screens/SalesManagementEdit';
import ProfileScreen from '../screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const LotteryResultsHeaderRight = ({ onNext }) => {
  return (
    <TouchableOpacity style={{ marginRight: 15 }} onPress={onNext}>
      <Ionicons name="camera" size={35} color="white" style={{ marginBottom: 20 }} />
    </TouchableOpacity>
  );
};

const DrawerNavigator = ({ navigation }) => {
  const handleLogout = () => {
    AsyncStorage.removeItem('agentId');
    AsyncStorage.removeItem('agentName');
    AsyncStorage.removeItem('agentNo');
       navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4169E1',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: 'white',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#FFFFFF',
        drawerActiveBackgroundColor: '#FFC107',
        drawerInactiveBackgroundColor: '#1E3A8A',
        drawerLabelStyle: {
          marginLeft: -16,
          fontSize: 16,
          paddingVertical: 10,
          color: '#FFFFFF',
        },
        drawerItemStyle: {
          paddingHorizontal: 15,
          marginVertical: 8,
          borderRadius: 10,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.toggleDrawer()}
            >
              <Image
                source={require('../assets/images/menu_icon.png')}
                style={{
                  width: 35,
                  height: 35,
                  tintColor: 'white',
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => null,
          drawerLabel: 'Home',
          drawerIcon: () => (
            <Ionicons name="home" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          ),
        })}
      />
      <Drawer.Screen
        name="SalesManagement"
        component={SalesManagementScreen}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.toggleDrawer()}
            >
              <Image
                source={require('../assets/images/menu_icon.png')}
                style={{
                  width: 35,
                  height: 35,
                  tintColor: 'white',
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => null,
          drawerLabel: 'Sales Management',
          drawerIcon: () => (
            <Ionicons name="cash" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          ),
        })}
      />
      <Drawer.Screen
        name="SalesDetails"
        component={SalesDetailsScreen}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.toggleDrawer()}
            >
              <Image
                source={require('../assets/images/menu_icon.png')}
                style={{
                  width: 35,
                  height: 35,
                  tintColor: 'white',
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => null,
          drawerLabel: 'Sales Details',
          drawerIcon: () => (
            <Ionicons name="list" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          ),
        })}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.toggleDrawer()}
            >
              <Image
                source={require('../assets/images/menu_icon.png')}
                style={{
                  width: 35,
                  height: 35,
                  tintColor: 'white',
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => null,
          drawerLabel: 'Profile',
          drawerIcon: () => (
            <Ionicons name="person" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          ),
        })}
      />
      <Drawer.Screen
        name="Logout"
        component={LoginScreen}
        options={({ navigation }) => ({
          title: 'Logout',
          headerShown: false,
          drawerLabel: 'Logout',
          drawerIcon: () => (
            <Ionicons name="log-out" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          ),
        })}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        })}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LotteryResults"
          component={LotteryResultsScreen}
          options={({ navigation, route }) => ({
            title: 'Lottery Results',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require('../assets/images/menu_icon.png')}
                  style={{
                    width: 35,
                    height: 35,
                    tintColor: 'white',
                    marginBottom: 20,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ),
            headerRight: route.params?.triggerCamera ? (
              <LotteryResultsHeaderRight
                onNext={() => navigation.replace('LotteryResults', { triggerCamera: true })}
              />
            ) : null,
          })}
        />
        <Stack.Screen
          name="SalesManagementEdit"
          component={SalesManagementEdit}
          options={{ title: 'Edit Sales' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;