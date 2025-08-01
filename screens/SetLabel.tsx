import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Buffer } from 'buffer';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define navigation param types
type RootStackParamList = {
  SetLabel: { userId: number };
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, 'SetLabel'>;

// Color constants
const Colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  text: '#2c3e50',
  background: '#f5f5f5',
  white: '#ffffff',
};

const Bluetooth = RNBluetoothClassic;

interface BluetoothDevice {
  name: string;
  address: string;
  id: string;
  isConnected: () => Promise<boolean>;
  connect: () => Promise<boolean>;
  write: (data: string) => Promise<void>;
}

interface ApiResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    weight: number;
  }[];
  shop_name: string | null;
  fssai: string | null;
}

const SetLabel = ({ route }: Props) => {
  const { userId } = route.params;
  const [items, setItems] = useState<ApiResponse['data']>([]);
  const [item, setItem] = useState('');
  const [weight, setWeight] = useState(0);
  const [mrp, setMrp] = useState('');
  const [usp, setUsp] = useState(0);
  const [pkdDate, setPkdDate] = useState(new Date());
  const [expDays, setExpDays] = useState(10);
  const [printCount, setPrintCount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [printerStatus, setPrinterStatus] = useState('disconnected');
  const [refreshing, setRefreshing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [printerModel, setPrinterModel] = useState('TSC');
  const [labelWidth] = useState(50);
  const [labelHeight] = useState(30);
  const [dpi] = useState(203);

  // Fetch items with userId
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>(
        `http://66.103.210.129:8777/label/printer/items/${userId}`
      );

      if (response.data.success) {
        setItems(response.data.data);
        const shopName = response.data.shop_name || 'Shop Name';
        console.log('Shop Name:', shopName);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load items. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const checkPrinterConnection = async () => {
    try {
      const devices = await Bluetooth.getConnectedDevices();
      if (devices.length > 0) {
        setPrinterStatus('connected');
        const device = devices[0];
        if (device.name && device.name.includes('TSC')) {
          setPrinterModel('TSC');
        } else if (device.name && device.name.includes('Zebra')) {
          setPrinterModel('Zebra');
        }
      } else {
        setPrinterStatus('disconnected');
      }
    } catch (error) {
      setPrinterStatus('error');
      console.error('Error checking printer connection:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchItems();
  }, [userId]);

  // Update weight when item changes
  useEffect(() => {
    const selectedItem = items.find(i => i.name === item);
    setWeight(selectedItem?.weight || 0);
  }, [item]);

  // Calculate USP when MRP or weight changes
  useEffect(() => {
    const calculatedUsp = weight > 0 ? parseFloat(mrp) / weight : 0;
    setUsp(calculatedUsp);
  }, [mrp, weight]);

  // Check printer connection status
  useEffect(() => {
    const checkPrinterConnection = async () => {
      try {
        const devices = await Bluetooth.getConnectedDevices();
        if (devices.length > 0) {
          setPrinterStatus('connected');
          const device = devices[0];
          if (device.name && device.name.includes('TSC')) {
            setPrinterModel('TSC');
          } else if (device.name && device.name.includes('Zebra')) {
            setPrinterModel('Zebra');
          }
        } else {
          setPrinterStatus('disconnected');
        }
      } catch (error) {
        setPrinterStatus('error');
        console.error('Error checking printer connection:', error);
      }
    };

    checkPrinterConnection();

    // Set up a listener for connection changes
    const subscription = Bluetooth.onDeviceConnected((event: any) => {
      setPrinterStatus('connected');
      if (event.name && event.name.includes('TSC')) {
        setPrinterModel('TSC');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
    checkPrinterConnection();
  };

  // Generate label preview
  const generatePreviewContent = () => {
    if (!item) return null;

    const expDate = new Date(pkdDate);
    expDate.setDate(expDate.getDate() + expDays);

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Label Preview (50x30mm)</Text>
        <View style={styles.labelPreview}>
          <Text style={styles.previewProductName}>{item}</Text>
          <Text style={styles.previewDetail}>
            wt: {weight}gms   MRP: Rs.{parseFloat(mrp).toFixed(2)}
          </Text>
          <Text style={styles.previewDetail}>
            USP: Rs.{usp.toFixed(2)}/gms
          </Text>
          <Text style={styles.previewDetail}>
            PKD: {pkdDate.toLocaleDateString('en-GB')}  EXP: {expDays}days
          </Text>
        </View>
      </View>
    );
  };

  // Convert mm to dots based on DPI
  const mmToDots = (mm: number) => {
    return Math.round((mm * dpi) / 25.4);
  };

  // Helper function to format date as DD/MM/YYYY
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Print label function using TSPL commands
  const handlePrint = async () => {
    if (!item) {
      Alert.alert('Error', 'Please select an item');
      return;
    }

    if (!mrp || isNaN(parseFloat(mrp)) || parseFloat(mrp) <= 0) {
      Alert.alert('Error', 'Please enter a valid MRP (must be greater than 0)');
      return;
    }

    if (!printCount || isNaN(parseInt(printCount)) || parseInt(printCount) <= 0) {
      Alert.alert('Error', 'Please enter a valid print count (must be at least 1)');
      return;
    }

    try {
      setIsLoading(true);

      const devices = await Bluetooth.getConnectedDevices();
      if (devices.length === 0) {
        Alert.alert('Printer Not Connected', 'Please connect to a Bluetooth printer', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handlePrint }
        ]);
        return;
      }

      const device = devices[0];
      const copies = Math.min(parseInt(printCount), 10);
      const expDate = new Date(pkdDate);
      expDate.setDate(expDate.getDate() + expDays);

      const widthDots = mmToDots(labelWidth);
      const gapHeight = mmToDots(2);

      const response = await axios.get<ApiResponse>(
        `http://66.103.210.129:8777/label/printer/items/${userId}`
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch items');
      }

      const shopName = response.data.shop_name || 'HOT CHIPS';
      const fssai = response.data.fssai || 'fs134678';

      // Helper function to calculate X to center
      const getCenterX = (text: string, fontDotsPerChar: number) => {
        const contentWidth = text.length * fontDotsPerChar;
        return Math.max(0, Math.floor((widthDots - contentWidth) / 2));
      };

      const shopX = getCenterX(shopName, 30); // TSS24.BF2, scale 2
      const fssaiX = getCenterX(`fssai: ${fssai}`, 13); // font "2"
      const itemX = getCenterX(`Item : ${item}`, 13); // font "4"
      const wtMrpX = getCenterX(`wt : ${weight}g   MRP : ₹${parseFloat(mrp).toFixed(2)}`, 12); // font "2"
      const datesX = getCenterX(`PKD:${formatDate(pkdDate)}-EXP:${formatDate(expDate)}`, 13); // font "1", scale 2 → 24

      const commands = [
        `SIZE ${labelWidth} mm, ${labelHeight} mm\n`,
        `GAP ${gapHeight} mm, 0\n`,
        'DENSITY 10\n',
        'DIRECTION 0\n',
        'CLS\n',

        `BOX 1,25,370,220,5\n`,
        `TEXT ${shopX},40,"TSS24.BF2",0,2,1,"${shopName}"\n`,
        `TEXT ${fssaiX},65,"2",0,1,1,"fssai: ${fssai}"\n`,
        `TEXT ${itemX},95,"4",0,1,1,"Item : ${item}"\n`,
        `TEXT ${wtMrpX},135,"2",0,1,2,"WT : ${weight}g   MRP : ${parseFloat(mrp).toFixed(2)}"\n`,
        `TEXT ${datesX},190,"1",0,1,1,"PKD:${formatDate(pkdDate)}-EXP:${formatDate(expDate)}"\n`,

        `PRINT ${copies},1`
      ].join('');

      if (!(await device.isConnected())) {
        const connected = await device.connect();
        if (!connected) throw new Error('Failed to connect to printer');
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await device.write(commands);
      Alert.alert('Success', `${copies} label(s) printed successfully!`);
    } catch (error: any) {
      console.error('Printing error:', error);
      Alert.alert('Printing Failed', error.message || 'Check printer connection and try again');
    } finally {
      setIsLoading(false);
    }
  };



  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Render printer status indicator
  const renderPrinterStatus = () => {
    let statusColor;
    let statusIcon;

    switch (printerStatus) {
      case 'connected':
        statusColor = Colors.success;
        statusIcon = 'printer-check';
        break;
      case 'disconnected':
        statusColor = Colors.warning;
        statusIcon = 'printer-alert';
        break;
      case 'error':
        statusColor = Colors.error;
        statusIcon = 'printer-off';
        break;
      default:
        statusColor = Colors.text;
        statusIcon = 'printer';
    }

    return (
      <View style={styles.statusContainer}>
        <Icon name={statusIcon} size={20} color={statusColor} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          Printer: {printerStatus} {printerStatus === 'connected' && `(${printerModel})`}
        </Text>
      </View>
    );
  };

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <Text style={styles.header}>Product Label Printer</Text>

      {renderPrinterStatus()}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Product</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={setItem}
            items={items.map(i => ({ label: i.name, value: i.name }))}
            placeholder={{ label: 'Select an item...', value: '' }}
            style={pickerSelectStyles}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Weight (g)</Text>
          <TextInput
            mode="outlined"
            value={weight.toString()}
            editable={false}
            style={styles.input}
            right={<TextInput.Affix text="g" />}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>MRP (Rs.)</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter MRP"
            value={mrp}
            keyboardType="numeric"
            onChangeText={setMrp}
            style={styles.input}
            right={<TextInput.Affix text="Rs." />}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Unit Selling Price</Text>
        <TextInput
          mode="outlined"
          value={`${usp.toFixed(2)}/g`}
          editable={false}
          style={styles.input}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Packing Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {pkdDate.toLocaleDateString('en-GB')}
            </Text>
            <Icon name="calendar" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <DateTimePickerModal
            mode="date"
            isVisible={showPicker}
            date={pkdDate}
            onConfirm={(d) => { setPkdDate(d); setShowPicker(false); }}
            onCancel={() => setShowPicker(false)}
            maximumDate={new Date()}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Expiry Period</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(v) => setExpDays(v)}
              items={[
                { label: '10 days', value: 10 },
                { label: '15 days', value: 15 },
                { label: '20 days', value: 20 },
                { label: '30 days', value: 30 },
              ]}
              value={expDays}
              style={pickerSelectStyles}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Copies</Text>
        <TextInput
          mode="outlined"
          placeholder="1"
          value={printCount}
          keyboardType="numeric"
          onChangeText={(text) => {
            if (/^\d*$/.test(text)) {
              setPrintCount(text);
            }
          }}
          style={styles.input}
        />
      </View>

      <Button
        mode="contained"
        onPress={() => setShowPreview(!showPreview)}
        style={styles.previewButton}
        labelStyle={styles.buttonLabel}
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </Button>

      {showPreview && generatePreviewContent()}

      <Button
        mode="contained"
        onPress={handlePrint}
        style={styles.printButton}
        labelStyle={styles.buttonLabel}
        disabled={isLoading || printerStatus !== 'connected'}
        loading={isLoading}
      >
        {isLoading ? 'Printing...' : 'Print Label'}
      </Button>

      {printerStatus !== 'connected' && (
        <Text style={styles.warningText}>
          {printerStatus === 'disconnected'
            ? 'Please connect a Bluetooth printer to print labels'
            : 'Error communicating with printer'}
        </Text>
      )}
    </ScrollView>
  );
};

// Picker styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

// Component styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  dateButtonText: {
    fontSize: 16,
  },
  previewButton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  printButton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    color: Colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  warningText: {
    marginTop: 12,
    color: Colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: Colors.white,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.primary,
    textAlign: 'center',
  },
  labelPreview: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    width: '100%',
    aspectRatio: 50 / 30, // 50x30mm ratio
    justifyContent: 'space-around',
  },
  previewProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.text,
  },
  previewDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: Colors.text,
  },
});

export default SetLabel;