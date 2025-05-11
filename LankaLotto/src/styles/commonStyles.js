// src/styles/commonStyles.js
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#000',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientButton: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  gradientButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientButtonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '700',
  },
  linkText: {
    fontSize: 18,
    color: '#4169E1',
    fontWeight: 'bold',
  },
});