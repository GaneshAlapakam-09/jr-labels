package com.labelprinter;

import F.f;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.io.IOException;
import java.util.UUID;

public class BluetoothManagerOLD {
  private static final int REQUEST_COARSE_LOCATION = 2;
  
  private static final int REQUEST_ENABLE_BT = 1;
  
  private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
  
  private static final String TAG = "BluetoothManager";
  
  private final Activity activity;
  
  private ArrayAdapter<String> arrayAdapter;
  
  private final BluetoothAdapter bluetoothAdapter;
  
  private BluetoothSocket bluetoothSocket;
  
  private ArrayAdapter<BluetoothDevice> btDevices;
  
  private final BroadcastReceiver btReceiver = new BroadcastReceiver() {
      final BluetoothManagerOLD this$0;
      
      @SuppressLint({"MissingPermission"})
      public void onReceive(Context param1Context, Intent param1Intent) {
        if ("android.bluetooth.device.action.FOUND".equals(param1Intent.getAction())) {
          BluetoothDevice bluetoothDevice = (BluetoothDevice)param1Intent.getParcelableExtra("android.bluetooth.device.extra.DEVICE");
          if (BluetoothManagerOLD.g(BluetoothManagerOLD.this) == null)
            BluetoothManagerOLD.h(BluetoothManagerOLD.this, new ArrayAdapter((Context)BluetoothManagerOLD.e(BluetoothManagerOLD.this), 17367043)); 
          if (BluetoothManagerOLD.g(BluetoothManagerOLD.this).getPosition(bluetoothDevice) < 0) {
            BluetoothManagerOLD.g(BluetoothManagerOLD.this).add(bluetoothDevice);
            if (bluetoothDevice != null) {
              ArrayAdapter arrayAdapter = BluetoothManagerOLD.f(BluetoothManagerOLD.this);
              StringBuilder stringBuilder = new StringBuilder();
              stringBuilder.append(bluetoothDevice.getName());
              stringBuilder.append("\n");
              stringBuilder.append(bluetoothDevice.getAddress());
              arrayAdapter.add(stringBuilder.toString());
            } 
            BluetoothManagerOLD.f(BluetoothManagerOLD.this).notifyDataSetInvalidated();
          } 
        } 
      }
    };
  
  public BluetoothManagerOLD(Activity paramActivity) {
    this.activity = paramActivity;
    this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
  }
  
  @SuppressLint({"MissingPermission"})
  private void proceedDiscovery() {
    IntentFilter intentFilter = new IntentFilter("android.bluetooth.device.action.FOUND");
    intentFilter.addAction("android.bluetooth.device.action.NAME_CHANGED");
    this.activity.registerReceiver(this.btReceiver, intentFilter);
    if (ContextCompat.checkSelfPermission((Context)this.activity, "android.permission.BLUETOOTH_SCAN") == 0) {
      this.bluetoothAdapter.startDiscovery();
      return;
    } 
    ActivityCompat.requestPermissions(this.activity, new String[] { "android.permission.BLUETOOTH_SCAN" }, 2);
  }
  
  @SuppressLint({"MissingPermission"})
  public void cleanUp() {
    BluetoothSocket bluetoothSocket = this.bluetoothSocket;
    if (bluetoothSocket != null) {
      try {
        bluetoothSocket.close();
      } catch (IOException iOException) {
        Log.e("BluetoothManager", "Failed to close socket", iOException);
      } 
      this.bluetoothSocket = null;
    } 
    BluetoothAdapter bluetoothAdapter = this.bluetoothAdapter;
    if (bluetoothAdapter != null)
      bluetoothAdapter.cancelDiscovery(); 
    ArrayAdapter<BluetoothDevice> arrayAdapter1 = this.btDevices;
    if (arrayAdapter1 != null) {
      arrayAdapter1.clear();
      this.btDevices = null;
    } 
    ArrayAdapter<String> arrayAdapter = this.arrayAdapter;
    if (arrayAdapter != null) {
      arrayAdapter.clear();
      this.arrayAdapter.notifyDataSetChanged();
      this.arrayAdapter.notifyDataSetInvalidated();
      this.arrayAdapter = null;
    } 
  }
  
  @SuppressLint({"MissingPermission"})
  public void connectToDevice(BluetoothDevice paramBluetoothDevice) {
    BluetoothAdapter bluetoothAdapter = this.bluetoothAdapter;
    if (bluetoothAdapter != null && !bluetoothAdapter.isDiscovering() && paramBluetoothDevice != null) {
      Activity activity = this.activity;
      StringBuilder stringBuilder = new StringBuilder("Connecting to ");
      stringBuilder.append(paramBluetoothDevice.getName());
      Toast.makeText((Context)activity, stringBuilder.toString(), 0).show();
      (new Thread(new c(this, paramBluetoothDevice, 2))).start();
    } 
  }
  
  @SuppressLint({"MissingPermission"})
  public void connectToDeviceFromCAPrinterDevice(CAPrinterDevice paramCAPrinterDevice) {
    BluetoothAdapter bluetoothAdapter = this.bluetoothAdapter;
    if (bluetoothAdapter != null && !bluetoothAdapter.isDiscovering() && paramCAPrinterDevice != null && paramCAPrinterDevice.port_type.equals("btspp")) {
      BluetoothDevice bluetoothDevice = getBluetoothDeviceFromAddress(paramCAPrinterDevice.port_address);
      if (bluetoothDevice != null) {
        Activity activity = this.activity;
        StringBuilder stringBuilder = new StringBuilder("Connecting to ");
        stringBuilder.append(bluetoothDevice.getName());
        Toast.makeText((Context)activity, stringBuilder.toString(), 0).show();
        (new Thread(new c(this, bluetoothDevice, 1))).start();
      } 
    } 
  }
  
  @SuppressLint({"MissingPermission"})
  public BluetoothDevice getBluetoothDeviceFromAddress(String paramString) {
    BluetoothAdapter bluetoothAdapter = this.bluetoothAdapter;
    if (bluetoothAdapter != null)
      for (BluetoothDevice bluetoothDevice : bluetoothAdapter.getBondedDevices()) {
        if (bluetoothDevice.getAddress().equals(paramString))
          return bluetoothDevice; 
      }  
    return null;
  }
  
  public BluetoothSocket getBluetoothSocket() {
    return this.bluetoothSocket;
  }
  
  @SuppressLint({"MissingPermission"})
  public void initialize() {
    BluetoothAdapter bluetoothAdapter = this.bluetoothAdapter;
    if (bluetoothAdapter == null) {
      Toast.makeText((Context)this.activity, "Bluetooth not supported", 1).show();
      return;
    } 
    if (bluetoothAdapter.isEnabled()) {
      proceedDiscovery();
      return;
    } 
    Intent intent = new Intent("android.bluetooth.adapter.action.REQUEST_ENABLE");
    this.activity.startActivityForResult(intent, 1);
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\BluetoothManagerOLD.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */