package com.labelprinter.sdk;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.IOException;
import java.util.UUID;

public class BluetoothManager {
    private static final int REQUEST_COARSE_LOCATION = 2;
    private static final int REQUEST_ENABLE_BT = 1;
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final String TAG = "BluetoothManager";

    private static BluetoothManager instance;

    private final Activity activity;
    private ArrayAdapter<String> arrayAdapter;
    private final BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private ArrayAdapter<BluetoothDevice> btDevices;

    private final BroadcastReceiver btReceiver = new BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        @Override
        public void onReceive(Context context, Intent intent) {
            if (BluetoothDevice.ACTION_FOUND.equals(intent.getAction())) {
                BluetoothDevice bluetoothDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (btDevices == null) {
                    btDevices = new ArrayAdapter<>(context, android.R.layout.simple_list_item_1);
                }
                if (btDevices.getPosition(bluetoothDevice) < 0) {
                    btDevices.add(bluetoothDevice);
                    if (bluetoothDevice != null) {
                        String name = bluetoothDevice.getName();
                        String address = bluetoothDevice.getAddress();
                        arrayAdapter.add(name + "\n" + address);
                    }
                    arrayAdapter.notifyDataSetInvalidated();
                }
            }
        }
    };

    private BluetoothManager(Activity activity) {
        this.activity = activity;
        this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    public static BluetoothManager getInstance(Activity activity) {
        if (instance == null) {
            instance = new BluetoothManager(activity);
        }
        return instance;
    }

    @SuppressLint("MissingPermission")
    private void proceedDiscovery() {
        IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
        intentFilter.addAction(BluetoothDevice.ACTION_NAME_CHANGED);
        activity.registerReceiver(btReceiver, intentFilter);

        if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.BLUETOOTH_SCAN) == 0) {
            bluetoothAdapter.startDiscovery();
        } else {
            ActivityCompat.requestPermissions(activity, new String[]{android.Manifest.permission.BLUETOOTH_SCAN}, REQUEST_COARSE_LOCATION);
        }
    }

    @SuppressLint("MissingPermission")
    public void cleanUp() {
        if (bluetoothSocket != null) {
            try {
                bluetoothSocket.close();
            } catch (IOException e) {
                Log.e(TAG, "Failed to close socket", e);
            }
            bluetoothSocket = null;
        }

        if (bluetoothAdapter != null) {
            bluetoothAdapter.cancelDiscovery();
        }

        if (btDevices != null) {
            btDevices.clear();
            btDevices = null;
        }

        if (arrayAdapter != null) {
            arrayAdapter.clear();
            arrayAdapter.notifyDataSetChanged();
            arrayAdapter.notifyDataSetInvalidated();
            arrayAdapter = null;
        }

        try {
            activity.unregisterReceiver(btReceiver);
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Receiver not registered or already unregistered", e);
        }
    }

    @SuppressLint("MissingPermission")
    public void connectToDevice(BluetoothDevice device) {
        if (bluetoothAdapter != null && !bluetoothAdapter.isDiscovering() && device != null) {
            Toast.makeText(activity, "Connecting to " + device.getName(), Toast.LENGTH_SHORT).show();
            new Thread(() -> {
                try {
                    bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                    bluetoothSocket.connect();
                    Log.d(TAG, "Connected to device");
                } catch (IOException e) {
                    Log.e(TAG, "Connection failed", e);
                }
            }).start();
        }
    }

    @SuppressLint("MissingPermission")
    public BluetoothDevice getBluetoothDeviceFromAddress(String address) {
        if (bluetoothAdapter != null) {
            for (BluetoothDevice device : bluetoothAdapter.getBondedDevices()) {
                if (device.getAddress().equals(address)) {
                    return device;
                }
            }
        }
        return null;
    }

    public BluetoothSocket getBluetoothSocket() {
        return bluetoothSocket;
    }

    @SuppressLint("MissingPermission")
    public void initialize() {
        if (bluetoothAdapter == null) {
            Toast.makeText(activity, "Bluetooth not supported", Toast.LENGTH_LONG).show();
            return;
        }

        if (bluetoothAdapter.isEnabled()) {
            proceedDiscovery();
        } else {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            activity.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        }
    }
}
