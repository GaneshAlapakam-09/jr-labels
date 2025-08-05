import React, { useEffect, useState, useCallback } from 'react';
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
import { debounce } from 'lodash';

interface Vendor {
  id: number;
  vendor_username: string;
  vendor_password: string;
  shop: string;
  fssai: string;
  role: string;
  item_count: number;
  last_login: string;
}

interface DashboardData {
  fssai: string;
  vendor_username: string;
  role: string;
  shopName: string;
  allVendors: Vendor[];
}

interface AddVendorForm {
  vendor_username: string;
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
    vendor_username: '',
    role: '',
    shopName: '',
    allVendors: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [errors, setErrors] = useState<Partial<AddVendorForm>>({});
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<AddVendorForm>({
    vendor_username: '',
    password: '',
    shop: '',
    fssai: '',
    role: 'vendor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [editUsernameAvailable, setEditUsernameAvailable] = useState<boolean | null>(null);
  const [checkingEditUsername, setCheckingEditUsername] = useState(false);

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

  // Debounced username availability check for add modal
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username.trim()) {
        setUsernameAvailable(null);
        return;
      }

      try {
        setCheckingUsername(true);
        const response = await axios.get(
          `http://66.103.210.129:8777/label/printer/check-username/?username=${username}`
        );
        setUsernameAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500),
    []
  );

  // Debounced username availability check for edit modal
  const checkEditUsernameAvailability = useCallback(
    debounce(async (username: string, currentUsername: string) => {
      if (!username.trim() || username === currentUsername) {
        setEditUsernameAvailable(null);
        return;
      }

      try {
        setCheckingEditUsername(true);
        const response = await axios.get(
          `http://66.103.210.129:8777/label/printer/check-username/?username=${username}`
        );
        setEditUsernameAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setEditUsernameAvailable(null);
      } finally {
        setCheckingEditUsername(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      checkUsernameAvailability.cancel();
      checkEditUsernameAvailability.cancel();
    };
  }, [checkUsernameAvailability, checkEditUsernameAvailability]);

  const validateForm = (data: AddVendorForm) => {
    const errors: Partial<AddVendorForm> = {};

    if (!data.vendor_username.trim()) {
      errors.vendor_username = 'Username is required';
    }

    if (data.shop.length > 15) {
      errors.shop = 'Shop name must be 14 characters or less';
    }

    if (data.fssai.length > 15) {
      errors.fssai = 'FSSAI must be 14 characters or less';
    }

    if (showAddVendorModal && !data.password.trim()) {
      errors.password = 'Password is required';
    }

    if (!data.shop.trim()) {
      errors.shop = 'Shop name is required';
    }

    if (!data.fssai.trim()) {
      errors.fssai = 'FSSAI is required';
    }

    return errors;
  };

  const handleAddVendor = async () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || usernameAvailable === false) {
      if (usernameAvailable === false && !validationErrors.vendor_username) {
        setErrors({
          ...errors,
          vendor_username: 'Username already exists'
        });
      }
      return;
    }

    try {
      await axios.post('http://66.103.210.129:8777/label/printer/addvendor/', formData);
      setShowAddVendorModal(false);
      setFormData({
        vendor_username: '',
        password: '',
        shop: '',
        fssai: '',
        role: 'vendor'
      });
      setErrors({});
      setUsernameAvailable(null);
      fetchData();
      Alert.alert('Success', 'Vendor added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add vendor');
      console.error(error);
    }
  };

  const handleEditVendor = async () => {
    if (!selectedVendor) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // Check if username was changed and validate availability
    if (formData.vendor_username !== selectedVendor.vendor_username) {
      if (editUsernameAvailable === false) {
        setErrors({
          ...errors,
          vendor_username: 'Username already exists'
        });
        return;
      }
      
      if (editUsernameAvailable === null) {
        Alert.alert('Please wait', 'Username availability check is in progress');
        return;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const payload = {
        vendor_username: formData.vendor_username,
        shop: formData.shop,
        fssai: formData.fssai,
        role: formData.role,
        ...(formData.password && { password: formData.password })
      };

      await axios.put(
        `http://66.103.210.129:8777/label/printer/updatevendor/${selectedVendor.id}`,
        payload
      );
      setShowEditVendorModal(false);
      setSelectedVendor(null);
      setErrors({});
      setEditUsernameAvailable(null);
      fetchData();
      Alert.alert('Success', 'Vendor updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update vendor');
      console.error(error);
    }
  };

  const handleCancelAdd = () => {
    setShowAddVendorModal(false);
    setFormData({
      vendor_username: '',
      password: '',
      shop: '',
      fssai: '',
      role: 'vendor'
    });
    setErrors({});
    setUsernameAvailable(null);
    setShowPassword(false);
  };

  const handleCancelEdit = () => {
    setShowEditVendorModal(false);
    setSelectedVendor(null);
    setFormData({
      vendor_username: '',
      password: '',
      shop: '',
      fssai: '',
      role: 'vendor'
    });
    setErrors({});
    setEditUsernameAvailable(null);
    setShowPassword(false);
  };

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendor_username: vendor.vendor_username,
      password: '',
      shop: vendor.shop,
      fssai: vendor.fssai,
      role: vendor.role
    });
    setEditUsernameAvailable(null);
    setShowPassword(false);
    setShowEditVendorModal(true);
  };

  const renderVendorItem = ({ item }: { item: Vendor }) => (
    <View style={styles.vendorCard}>
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.shop}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Username:</Text>
          <Text style={styles.detailValue}>{item.vendor_username}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Password:</Text>
          <Text style={styles.detailValue}>{item.vendor_password}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>FSSAI:</Text>
          <Text style={styles.detailValue}>{item.fssai}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>{item.role}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items:</Text>
          <Text style={styles.detailValue}>{item.item_count}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Login:</Text>
          <Text style={styles.detailValue}>{item.last_login}</Text>
        </View>
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
          <Text style={styles.usernameText}>Username: {dashboardData.vendor_username}</Text>
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
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vendor</Text>

            <TextInput
              style={[styles.input, (usernameAvailable === false || errors.vendor_username) && styles.inputError]}
              placeholder="Username"
              value={formData.vendor_username}
              onChangeText={(text) => {
                setFormData({ ...formData, vendor_username: text });
                checkUsernameAvailability(text);
                if (errors.vendor_username) setErrors({ ...errors, vendor_username: undefined });
              }}
            />
            {checkingUsername && (
              <View style={styles.availabilityCheck}>
                <ActivityIndicator size="small" color="#6b46c1" />
                <Text style={styles.availabilityText}>Checking availability...</Text>
              </View>
            )}
            {usernameAvailable === false && (
              <Text style={styles.errorText}>Username already exists</Text>
            )}
            {usernameAvailable === true && (
              <Text style={styles.availableText}>Username available</Text>
            )}
            {errors.vendor_username && (
              <Text style={styles.errorText}>{errors.vendor_username}</Text>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }, errors.password && styles.inputError]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              style={[styles.input, errors.shop && styles.inputError]}
              placeholder="Shop Name"
              value={formData.shop}
              onChangeText={(text) => {
                setFormData({ ...formData, shop: text });
                if (errors.shop) setErrors({ ...errors, shop: undefined });
              }}
              maxLength={14}
            />
            {errors.shop && <Text style={styles.errorText}>{errors.shop}</Text>}

            <TextInput
              style={[styles.input, errors.fssai && styles.inputError]}
              placeholder="FSSAI Number"
              value={formData.fssai}
              onChangeText={(text) => {
                setFormData({ ...formData, fssai: text });
                if (errors.fssai) setErrors({ ...errors, fssai: undefined });
              }}
              maxLength={14}
            />
            {errors.fssai && <Text style={styles.errorText}>{errors.fssai}</Text>}

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'admin' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, role: 'admin' })}
              >
                <Text style={formData.role === 'admin' ? styles.roleButtonTextSelected : styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'vendor' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, role: 'vendor' })}
              >
                <Text style={formData.role === 'vendor' ? styles.roleButtonTextSelected : styles.roleButtonText}>Vendor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelAdd}
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
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Vendor</Text>

            <TextInput
              style={[styles.input, (editUsernameAvailable === false || errors.vendor_username) && styles.inputError]}
              placeholder="Username"
              value={formData.vendor_username}
              onChangeText={(text) => {
                setFormData({ ...formData, vendor_username: text });
                if (selectedVendor) {
                  checkEditUsernameAvailability(text, selectedVendor.vendor_username);
                }
                if (errors.vendor_username) setErrors({ ...errors, vendor_username: undefined });
              }}
            />
            {checkingEditUsername && (
              <View style={styles.availabilityCheck}>
                <ActivityIndicator size="small" color="#6b46c1" />
                <Text style={styles.availabilityText}>Checking availability...</Text>
              </View>
            )}
            {editUsernameAvailable === false && (
              <Text style={styles.errorText}>Username already exists</Text>
            )}
            {editUsernameAvailable === true && (
              <Text style={styles.availableText}>Username available</Text>
            )}
            {errors.vendor_username && (
              <Text style={styles.errorText}>{errors.vendor_username}</Text>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password (leave empty to keep unchanged)"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, errors.shop && styles.inputError]}
              placeholder="Shop Name"
              value={formData.shop}
              onChangeText={(text) => {
                setFormData({ ...formData, shop: text });
                if (errors.shop) setErrors({ ...errors, shop: undefined });
              }}
              maxLength={14}
            />
            {errors.shop && <Text style={styles.errorText}>{errors.shop}</Text>}

            <TextInput
              style={[styles.input, errors.fssai && styles.inputError]}
              placeholder="FSSAI Number"
              value={formData.fssai}
              onChangeText={(text) => {
                setFormData({ ...formData, fssai: text });
                if (errors.fssai) setErrors({ ...errors, fssai: undefined });
              }}
              maxLength={14}
            />
            {errors.fssai && <Text style={styles.errorText}>{errors.fssai}</Text>}

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'admin' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, role: 'admin' })}
              >
                <Text style={formData.role === 'admin' ? styles.roleButtonTextSelected : styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'vendor' && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, role: 'vendor' })}
              >
                <Text style={formData.role === 'vendor' ? styles.roleButtonTextSelected : styles.roleButtonText}>Vendor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
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
    marginBottom: 4,
  },
  usernameText: {
    color: 'white',
    fontSize: 16,
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
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  availableText: {
    color: '#38a169',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
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
    marginBottom: 8,
    color: '#2d3748',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: 'bold',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#4a5568',
    flex: 1,
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
    marginBottom: 8,
    color: '#2d3748',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    padding: 10,
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
  availabilityCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    marginLeft: 8,
    color: '#4a5568',
    fontSize: 12,
  },
});

export default Dashboard;