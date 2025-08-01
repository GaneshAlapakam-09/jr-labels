import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Button
} from 'react-native';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define your navigation param types
type RootStackParamList = {
  ListMain: { userId: number };
  AddItem: { userId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ListMain'>;

interface ApiResponse {
  success: boolean;
  data: Item[];
}

interface Item { 
  id: number;
  name: string; 
  weight: number; 
}

const ListItems = ({ navigation, route }: Props) => {
  const { userId } = route.params;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    weight: ''
  });

  const validateForm = () => {
    const errors = {
      name: '',
      weight: ''
    };
    let isValid = true;

    if (!editedName.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!editedWeight.trim()) {
      errors.weight = 'Weight is required';
      isValid = false;
    } else if (isNaN(parseFloat(editedWeight))) {
      errors.weight = 'Weight must be a number';
      isValid = false;
    } else if (parseFloat(editedWeight) <= 0) {
      errors.weight = 'Weight must be greater than 0';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get<ApiResponse>(`http://66.103.210.129:8777/label/printer/items/${userId}`);
      if (response.data.success) {
        setItems(response.data.data);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to fetch items. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(id),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`http://66.103.210.129:8777/label/printer/update_item/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete item. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const handleEditPress = (item: Item) => {
    setCurrentItem(item);
    setEditedName(item.name);
    setEditedWeight(item.weight.toString());
    setEditModalVisible(true);
    setValidationErrors({ name: '', weight: '' });
  };

  const handleSaveEdit = async () => {
    if (!currentItem) return;

    if (!validateForm()) {
      return;
    }

    try {
      const updatedItem = {
        ...currentItem,
        name: editedName.trim(),
        weight: parseFloat(editedWeight)
      };

      await axios.put(
        `http://66.103.210.129:8777/label/printer/update_item/${currentItem.id}`,
        updatedItem
      );
      
      setItems(items.map(item => 
        item.id === currentItem.id ? updatedItem : item
      ));
      
      setEditModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update item. Please try again.');
      console.error('Update error:', err);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={50} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Retry" 
          onPress={fetchItems} 
          color="#6200ee"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Items</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddItem', { userId })}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemWeight}>{item.weight} gm</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEditPress(item)}>
                <Icon name="edit" size={20} color="#6200ee" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Icon name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={50} color="#999" />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Add your first item by tapping the + button</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        contentContainerStyle={items.length === 0 ? styles.emptyList : null}
      />

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            
            <TextInput
              style={[styles.input, validationErrors.name ? styles.inputError : null]}
              value={editedName}
              onChangeText={(text) => {
                setEditedName(text);
                if (validationErrors.name) {
                  setValidationErrors({...validationErrors, name: ''});
                }
              }}
              placeholder="Item name"
              autoFocus={true}
            />
            {validationErrors.name ? (
              <Text style={styles.errorMessage}>{validationErrors.name}</Text>
            ) : null}
            
            <TextInput
              style={[styles.input, validationErrors.weight ? styles.inputError : null]}
              value={editedWeight}
              onChangeText={(text) => {
                setEditedWeight(text);
                if (validationErrors.weight) {
                  setValidationErrors({...validationErrors, weight: ''});
                }
              }}
              placeholder="Weight (kg)"
              keyboardType="numeric"
            />
            {validationErrors.weight ? (
              <Text style={styles.errorMessage}>{validationErrors.weight}</Text>
            ) : null}
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#03dac6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginVertical: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ListItems;