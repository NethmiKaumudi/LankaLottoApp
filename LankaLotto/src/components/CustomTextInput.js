import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  keyboardType = 'default',
  showPassword,
  togglePasswordVisibility,
  isPassword = false,
  editable = true, // Added to control editable state
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {isPassword ? (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            placeholder={placeholder}
            keyboardType={keyboardType}
            editable={editable}
          />
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.eyeIconContainer}
          >
            <Image 
              source={showPassword ? 
                require('../assets/images/eye_visible.png') : 
                require('../assets/images/eye_hidden.png')} 
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]} // Apply disabled style if not editable
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: 10, // Adjusted for tighter spacing
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
    color: '#000',
  },
  input: {
    width: '100%',
    height: 40, // Smaller height to match screenshot
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: '#F0F0F0', // Gray background for non-editable fields
    color: '#666', // Dimmed text for non-editable fields
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    height: 40, // Smaller height
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    color: '#000',
    fontSize: 14,
  },
  eyeIconContainer: {
    padding: 8,
    height: 40,
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 20, // Slightly smaller icon
    height: 20,
  },
});

export default CustomTextInput;