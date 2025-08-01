import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Vendor {
  id: number;
  shop: string;
  fssai: string;
  role: string;
}

interface DashboardData {
  fssai: string;
  role: string;
  shopName: string;
  allVendors: Vendor[];
}

interface AddVendorForm {
  username: string;
  password: string;
  shop: string;
  fssai: string;
  role: string;
}

interface DashboardScreenProps {
  route: {
    params: {
      userId: number;
    };
  };
}

const Dashboard: React.FC<DashboardScreenProps> = ({ route }) => {
  const { userId } = route.params;
  const [dashboardData, setDashboardData] = useState<DashboardData>({ 
    fssai: '', 
    role: '', 
    shopName: '', 
    allVendors: [] 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<AddVendorForm>({
    username: '',
    password: '',
    shop: '',
    fssai: '',
    role: 'vendor'
  });

  const fetchData = async () => {
    try {
      setError('');
      const response = await axios.get(`http://66.103.210.129:8777/label/printer/dashboard/${userId}`);
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddVendor = async () => {
    try {
      await axios.post('http://66.103.210.129:8777/label/printer/addvendor/', formData);
      setShowAddVendorModal(false);
      setFormData({
        username: '',
        password: '',
        shop: '',
        fssai: '',
        role: 'vendor'
      });
      fetchData();
      Alert.alert('Success', 'Vendor added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add vendor');
      console.error(error);
    }
  };

  const handleEditVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await axios.put(`http://66.103.210.129:8777/label/printer/updatevendor/${selectedVendor.id}/`, formData);
      setShowEditVendorModal(false);
      setSelectedVendor(null);
      fetchData();
      Alert.alert('Success', 'Vendor updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update vendor');
      console.error(error);
    }
  };

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      username: '',
      password: '',
      shop: vendor.shop,
      fssai: vendor.fssai,
      role: vendor.role
    });
    setShowEditVendorModal(true);
  };

  const renderVendorItem = ({ item }: { item: Vendor }) => (
    <View style={styles.vendorCard}>
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.shop}</Text>
        <Text style={styles.vendorFssai}>FSSAI: {item.fssai}</Text>
        <Text style={styles.vendorRole}>Role: {item.role}</Text>
      </View>
      {dashboardData.role === 'admin' && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Icon name="edit" size={20} color="#6b46c1" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="error-outline" size={50} color="#e53e3e" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
          <Icon name="refresh" size={30} color="#6b46c1" />
          <Text style={styles.refreshText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6b46c1']}
          tintColor="#6b46c1"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{dashboardData.shopName}</Text>
          <Text style={styles.roleText}>Role: {dashboardData.role}</Text>
        </View>
        <Image
          source={require('../assets/fast-food.png')}
          style={styles.shopImage}
        />
      </View>

      {/* FSSAI Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="receipt" size={24} color="#6b46c1" />
          <Text style={styles.cardTitle}>FSSAI License</Text>
        </View>
        <Text style={styles.cardValue}>{dashboardData.fssai}</Text>
      </View>

      {/* Admin Section */}
      {dashboardData.role === 'admin' && (
        <View style={styles.adminSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vendor Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddVendorModal(true)}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dashboardData.allVendors}
            renderItem={renderVendorItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Add Vendor Modal */}
      <Modal
        visible={showAddVendorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVendorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vendor</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Shop Name"
              value={formData.shop}
              onChangeText={(text) => setFormData({...formData, shop: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="FSSAI Number"
              value={formData.fssai}
              onChangeText={(text) => setFormData({...formData, fssai: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'admin' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({...formData, role: 'admin'})}
              >
                <Text style={formData.role === 'admin' ? styles.roleButtonTextSelected : styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'vendor' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({...formData, role: 'vendor'})}
              >
                <Text style={formData.role === 'vendor' ? styles.roleButtonTextSelected : styles.roleButtonText}>Vendor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddVendorModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddVendor}
              >
                <Text style={styles.submitButtonText}>Add Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal
        visible={showEditVendorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditVendorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Vendor</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password (leave empty to keep unchanged)"
              secureTextEntry={true}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Shop Name"
              value={formData.shop}
              onChangeText={(text) => setFormData({...formData, shop: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="FSSAI Number"
              value={formData.fssai}
              onChangeText={(text) => setFormData({...formData, fssai: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'admin' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({...formData, role: 'admin'})}
              >
                <Text style={formData.role === 'admin' ? styles.roleButtonTextSelected : styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'vendor' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({...formData, role: 'vendor'})}
              >
                <Text style={formData.role === 'vendor' ? styles.roleButtonTextSelected : styles.roleButtonText}>Vendor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditVendorModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleEditVendor}
              >
                <Text style={styles.submitButtonText}>Update Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6b46c1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  roleText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2d3748',
  },
  cardValue: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 32,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    marginHorizontal: 24,
  },
  refreshButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    color: '#6b46c1',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  adminSection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  addButton: {
    backgroundColor: '#6b46c1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vendorFssai: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  vendorRole: {
    fontSize: 14,
    color: '#4a5568',
  },
  editButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2d3748',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    color: '#2d3748',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleLabel: {
    marginRight: 10,
    color: '#2d3748',
  },
  roleButton: {
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  roleButtonSelected: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  roleButtonText: {
    color: '#2d3748',
  },
  roleButtonTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#6b46c1',
  },
  cancelButtonText: {
    color: '#4a5568',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Dashboard;