package com.labelprinter;

import C.a;
import android.util.Log;
import java.util.List;
import java.util.Objects;

public class CAPrinterDevice {
  public static final String PrinterDevicePortTypeBtBle = "btble";
  
  public static final String PrinterDevicePortTypeBtSpp = "btspp";
  
  public static final String PrinterDevicePortTypeCom = "com";
  
  public static final String PrinterDevicePortTypeTcp = "tcp";
  
  public static final String PrinterDevicePortTypeUsb = "usb";
  
  private static final String TAG = "CAPrinterDevice";
  
  protected final int autoreplymode = 1;
  
  public int comBaudrate = 115200;
  
  public int comDataBits = 8;
  
  public int comFlowControl = 0;
  
  public int comParity = 0;
  
  public int comStopBits = 0;
  
  public String port_address;
  
  public final String port_type;
  
  public final String printer_name;
  
  public int tcpPortNumber = 9100;
  
  public CAPrinterDevice(String paramString1, String paramString2, String paramString3) {
    this.printer_name = paramString1;
    this.port_type = paramString2;
    this.port_address = paramString3;
  }
  
  public static CAPrinterDevice fromUidString(String paramString) {
    if (paramString != null)
      try {
        if (!paramString.trim().isEmpty()) {
          String[] arrayOfString = paramString.split("\\|");
          if (arrayOfString.length == 3) {
            String str2 = arrayOfString[0];
            String str1 = arrayOfString[1];
            String str3 = arrayOfString[2];
            CAPrinterDevice cAPrinterDevice = new CAPrinterDevice();
            this(str2, str1, str3);
            int i = "tcp".compareTo(str1);
            return cAPrinterDevice;
          } 
        } 
      } finally {
        paramString = null;
      }  
    return null;
  }
  
  public static int indexOfPrinterByPort(List<CAPrinterDevice> paramList, String paramString1, String paramString2) {
    for (byte b = 0; b < paramList.size(); b++) {
      CAPrinterDevice cAPrinterDevice = paramList.get(b);
      if (cAPrinterDevice.port_type.compareTo(paramString1) == 0 && cAPrinterDevice.port_address.compareTo(paramString2) == 0)
        return b; 
    } 
    return -1;
  }
  
  public static boolean isPortEqual(CAPrinterDevice paramCAPrinterDevice1, CAPrinterDevice paramCAPrinterDevice2) {
    return (paramCAPrinterDevice1 != null && paramCAPrinterDevice2 != null && paramCAPrinterDevice1.port_type.compareTo(paramCAPrinterDevice2.port_type) == 0 && paramCAPrinterDevice1.port_address.compareTo(paramCAPrinterDevice2.port_address) == 0 && paramCAPrinterDevice1.comBaudrate == paramCAPrinterDevice2.comBaudrate && paramCAPrinterDevice1.comDataBits == paramCAPrinterDevice2.comDataBits && paramCAPrinterDevice1.comParity == paramCAPrinterDevice2.comParity && paramCAPrinterDevice1.comStopBits == paramCAPrinterDevice2.comStopBits && paramCAPrinterDevice1.comFlowControl == paramCAPrinterDevice2.comFlowControl && paramCAPrinterDevice1.tcpPortNumber == paramCAPrinterDevice2.tcpPortNumber) ? true : ((paramCAPrinterDevice1 == null && paramCAPrinterDevice2 == null));
  }
  
  public static boolean isPrinterEqual(CAPrinterDevice paramCAPrinterDevice1, CAPrinterDevice paramCAPrinterDevice2) {
    if (isPortEqual(paramCAPrinterDevice1, paramCAPrinterDevice2)) {
      String str = paramCAPrinterDevice1.printer_name;
      if (str == null && paramCAPrinterDevice2.printer_name == null)
        return true; 
      if (str != null && str.compareTo(paramCAPrinterDevice2.printer_name) == 0)
        return true; 
    } 
    return false;
  }
  
  private static void test() {
    CAPrinterDevice cAPrinterDevice3 = new CAPrinterDevice("ComDevice", "com", "/dev/ttyUSB0");
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice3));
    cAPrinterDevice3.comBaudrate = 9600;
    cAPrinterDevice3.comFlowControl = 2;
    String str2 = toUidString(cAPrinterDevice3);
    Log.i("CAPrinterDevice", str2);
    CAPrinterDevice cAPrinterDevice2 = fromUidString(str2);
    Objects.requireNonNull(cAPrinterDevice2);
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice2));
    cAPrinterDevice2 = fromUidString("ComDevice|com|/dev/ttyUSB0");
    Objects.requireNonNull(cAPrinterDevice2);
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice2));
    cAPrinterDevice2 = new CAPrinterDevice("Prn112233", "tcp", "192.168.1.87");
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice2));
    cAPrinterDevice2.tcpPortNumber = 9000;
    String str1 = toUidString(cAPrinterDevice2);
    Log.i("CAPrinterDevice", str1);
    CAPrinterDevice cAPrinterDevice1 = fromUidString(str1);
    Objects.requireNonNull(cAPrinterDevice1);
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice1));
    cAPrinterDevice1 = fromUidString("Prn112233|tcp|192.168.1.87");
    Objects.requireNonNull(cAPrinterDevice1);
    Log.i("CAPrinterDevice", toUidString(cAPrinterDevice1));
  }
  
  public static String toUidString(CAPrinterDevice paramCAPrinterDevice) {
    StringBuilder stringBuilder1;
    StringBuilder stringBuilder2 = new StringBuilder();
    stringBuilder2.append(paramCAPrinterDevice.printer_name);
    stringBuilder2.append("|");
    stringBuilder2.append(paramCAPrinterDevice.port_type);
    stringBuilder2.append("|");
    stringBuilder2.append(paramCAPrinterDevice.port_address);
    String str = stringBuilder2.toString();
    if ("tcp".compareTo(paramCAPrinterDevice.port_type) == 0) {
      stringBuilder1 = a.t(str, ":");
      stringBuilder1.append(paramCAPrinterDevice.tcpPortNumber);
      return stringBuilder1.toString();
    } 
    if ("com".compareTo(paramCAPrinterDevice.port_type) == 0) {
      stringBuilder1 = a.t((String)stringBuilder1, ":");
      stringBuilder1.append(paramCAPrinterDevice.comBaudrate);
      stringBuilder1.append(",");
      stringBuilder1.append(paramCAPrinterDevice.comDataBits);
      stringBuilder1.append(",");
      stringBuilder1.append(paramCAPrinterDevice.comParity);
      stringBuilder1.append(",");
      stringBuilder1.append(paramCAPrinterDevice.comStopBits);
      stringBuilder1.append(",");
      stringBuilder1.append(paramCAPrinterDevice.comFlowControl);
      return stringBuilder1.toString();
    } 
    return (String)stringBuilder1;
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\CAPrinterDevice.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */