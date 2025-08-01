package com.labelprinter;

import android.graphics.Bitmap;
import android.util.Log;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Utils {
  public static final byte[] UNICODE_TEXT = new byte[] { 
      35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 
      35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 
      35, 35, 35, 35, 35, 35, 35, 35, 35, 35 };
  
  private static final String[] binaryArray = new String[] { 
      "0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", 
      "1010", "1011", "1100", "1101", "1110", "1111" };
  
  private static List<String> binaryListToHexStringList(List<String> paramList) {
    ArrayList<String> arrayList = new ArrayList();
    for (String str : paramList) {
      StringBuilder stringBuilder = new StringBuilder();
      for (int i = 0; i < str.length(); i = j) {
        int j = i + 8;
        stringBuilder.append(myBinaryStrToHexString(str.substring(i, j)));
      } 
      arrayList.add(stringBuilder.toString());
    } 
    return arrayList;
  }
  
  private static byte charToByte(char paramChar) {
    return (byte)"0123456789ABCDEF".indexOf(paramChar);
  }
  
  public static byte[] decodeBitmap(Bitmap paramBitmap) {
    if (paramBitmap == null) {
      Log.e("decodeBitmap", "Bitmap is null");
      return null;
    } 
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    int k = (i + 7) / 8;
    ArrayList<Byte> arrayList = new ArrayList();
    String.format("%04x", new Object[] { Integer.valueOf(k) }).toUpperCase();
    String.format("%04x", new Object[] { Integer.valueOf(j) }).toUpperCase();
    arrayList.add(Byte.valueOf((byte)29));
    arrayList.add(Byte.valueOf((byte)118));
    arrayList.add(Byte.valueOf((byte)48));
    byte b3 = 0;
    arrayList.add(Byte.valueOf((byte)0));
    arrayList.add(Byte.valueOf((byte)(k & 0xFF)));
    arrayList.add(Byte.valueOf((byte)(k >> 8 & 0xFF)));
    arrayList.add(Byte.valueOf((byte)(j & 0xFF)));
    arrayList.add(Byte.valueOf((byte)(j >> 8 & 0xFF)));
    for (byte b2 = 0; b2 < j; b2++) {
      for (byte b = 0; b < k * 8; b += 8) {
        byte b4 = 0;
        int m = 0;
        while (b4 < 8) {
          int n = b + b4;
          if (n < i) {
            n = paramBitmap.getPixel(n, b2);
            if ((n >> 16 & 0xFF) <= 160 || (n >> 8 & 0xFF) <= 160 || (n & 0xFF) <= 160) {
              m = m << 1 | 0x1;
              continue;
            } 
          } 
          m <<= 1;
          continue;
          b4++;
        } 
        arrayList.add(Byte.valueOf((byte)m));
      } 
    } 
    byte[] arrayOfByte = new byte[arrayList.size()];
    for (byte b1 = b3; b1 < arrayList.size(); b1++)
      arrayOfByte[b1] = ((Byte)arrayList.get(b1)).byteValue(); 
    return arrayOfByte;
  }
  
  private static byte[] hexList2Byte(List<String> paramList) {
    ArrayList<byte[]> arrayList = new ArrayList();
    Iterator<String> iterator = paramList.iterator();
    while (iterator.hasNext())
      arrayList.add(hexStringToBytes(iterator.next())); 
    return sysCopy((List<byte[]>)arrayList);
  }
  
  private static byte[] hexStringToBytes(String paramString) {
    if (paramString == null || paramString.isEmpty())
      return null; 
    paramString = paramString.toUpperCase();
    int i = paramString.length() / 2;
    char[] arrayOfChar = paramString.toCharArray();
    byte[] arrayOfByte = new byte[i];
    for (byte b = 0; b < i; b++) {
      int j = b * 2;
      byte b1 = charToByte(arrayOfChar[j]);
      arrayOfByte[b] = (byte)(charToByte(arrayOfChar[j + 1]) | b1 << 4);
    } 
    return arrayOfByte;
  }
  
  private static String myBinaryStrToHexString(String paramString) {
    byte b2;
    StringBuilder stringBuilder = new StringBuilder();
    byte b3 = 0;
    String str = paramString.substring(0, 4);
    paramString = paramString.substring(4, 8);
    byte b1 = 0;
    while (true) {
      String[] arrayOfString = binaryArray;
      b2 = b3;
      if (b1 < arrayOfString.length) {
        if (str.equals(arrayOfString[b1]))
          stringBuilder.append("0123456789ABCDEF".charAt(b1)); 
        b1++;
        continue;
      } 
      break;
    } 
    while (true) {
      String[] arrayOfString = binaryArray;
      if (b2 < arrayOfString.length) {
        if (paramString.equals(arrayOfString[b2]))
          stringBuilder.append("0123456789ABCDEF".charAt(b2)); 
        b2++;
        continue;
      } 
      return stringBuilder.toString();
    } 
  }
  
  private static byte[] sysCopy(List<byte[]> paramList) {
    Iterator<byte> iterator2 = paramList.iterator();
    int i;
    for (i = 0; iterator2.hasNext(); i += ((byte[])iterator2.next()).length);
    byte[] arrayOfByte = new byte[i];
    Iterator<byte> iterator1 = paramList.iterator();
    for (i = 0; iterator1.hasNext(); i += arrayOfByte1.length) {
      byte[] arrayOfByte1 = (byte[])iterator1.next();
      System.arraycopy(arrayOfByte1, 0, arrayOfByte, i, arrayOfByte1.length);
    } 
    return arrayOfByte;
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\Utils.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */