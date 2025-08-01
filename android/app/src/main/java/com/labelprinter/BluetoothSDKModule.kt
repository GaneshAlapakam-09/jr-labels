package com.labelprinter

import android.app.Activity
import com.facebook.react.bridge.*
import com.labelprinter.sdk.BluetoothManager

class BluetoothSDKModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BluetoothSDK"

    @ReactMethod
    fun connectToDevice(address: String, promise: Promise) {
        val activity: Activity? = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        val bluetoothManager = BluetoothManager.getInstance(activity)
        val device = bluetoothManager.getBluetoothDeviceFromAddress(address)
        if (device != null) {
            bluetoothManager.connectToDevice(device)
            promise.resolve("Connecting to device: ${device.name}")
        } else {
            promise.reject("DEVICE_NOT_FOUND", "Bluetooth device not found for address: $address")
        }
    }

    @ReactMethod
    fun initialize(promise: Promise) {
        val activity: Activity? = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        BluetoothManager.getInstance(activity).initialize()
        promise.resolve("Bluetooth initialized")
    }
}
