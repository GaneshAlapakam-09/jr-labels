import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define your navigation param types
type RootStackParamList = {
  AddItem: { userId: number };
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

const AddItem = ({ navigation, route }: Props) => {
  const { userId } = route.params;
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    weight: ''
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      weight: ''
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Item name is required';
      isValid = false;
    } else if (name.trim().length > 20) {
      newErrors.name = 'Item name must be 20 characters or less';
      isValid = false;
    }

    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
      isValid = false;
    } else if (isNaN(parseFloat(weight))) {
      newErrors.weight = 'Weight must be a number';
      isValid = false;
    } else if (parseFloat(weight) <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://66.103.210.129:8777/label/printer/additems/', {
        name: name.trim(),
        weight: parseFloat(weight),
        user_id: userId  // Include userId in the request body
      });

      Alert.alert(
        'Success',
        `Item "${response.data.name}" (${response.data.weight}kg) added successfully!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setName('');
              setWeight('');
            }
          },
          {
            text: 'View List',
            onPress: () => navigation.goBack()
          }
        ]
      );

      console.log('Created item:', response.data);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to add item. Please try again.'
        );
        console.error('Axios error:', error.response);
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
        console.error('Unknown error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Item</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            placeholder="Enter item name"
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            maxLength={20}
          />
          <Text style={styles.charCounter}>
            {name.length}/20 characters
          </Text>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            placeholder="Enter weight in kg"
            style={[styles.input, errors.weight ? styles.inputError : null]}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (errors.weight) setErrors({ ...errors, weight: '' });
            }}
            keyboardType="numeric"
          />
          {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Add Item</Text>
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#6200ee" />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    height: 50,
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#6200ee',
    fontSize: 16,
    marginLeft: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default AddItem;