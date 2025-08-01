package com.labelprinter;

import android.bluetooth.BluetoothSocket;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Objects;

public class PrinterSDK {
  private InputStream inputStream;
  
  private OutputStream outputStream;
  
  public PrinterSDK(BluetoothSocket paramBluetoothSocket) {
    try {
      this.outputStream = paramBluetoothSocket.getOutputStream();
      this.inputStream = paramBluetoothSocket.getInputStream();
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  private Bitmap applyDithering(Bitmap paramBitmap) {
    int j = paramBitmap.getWidth();
    int i = paramBitmap.getHeight();
    int[] arrayOfInt = new int[j * i];
    paramBitmap.getPixels(arrayOfInt, 0, j, 0, 0, j, i);
    for (byte b = 0; b < i; b++) {
      int k;
      for (k = 0; k < j; k = m) {
        int n = b * j + k;
        int i1 = arrayOfInt[n];
        int m = 255;
        double d1 = (i1 >> 16 & 0xFF);
        double d2 = (i1 >> 8 & 0xFF);
        i1 = (int)((i1 & 0xFF) * 0.114D + d2 * 0.587D + d1 * 0.299D);
        if (i1 <= 128)
          m = 0; 
        arrayOfInt[n] = 0xFF000000 | m << 16 | m << 8 | m;
        n = i1 - m;
        m = k + 1;
        if (m < j)
          applyError(arrayOfInt, j, m, b, n, 0.4375D); 
        i1 = k - 1;
        if (i1 >= 0) {
          int i2 = b + 1;
          if (i2 < i)
            applyError(arrayOfInt, j, i1, i2, n, 0.1875D); 
        } 
        i1 = b + 1;
        if (i1 < i)
          applyError(arrayOfInt, j, k, i1, n, 0.3125D); 
        if (m < j && i1 < i)
          applyError(arrayOfInt, j, m, i1, n, 0.0625D); 
      } 
    } 
    Bitmap.Config config = paramBitmap.getConfig();
    Objects.requireNonNull(config);
    Bitmap bitmap = Bitmap.createBitmap(j, i, config);
    bitmap.setPixels(arrayOfInt, 0, j, 0, 0, j, i);
    return bitmap;
  }
  
  private void applyError(int[] paramArrayOfint, int paramInt1, int paramInt2, int paramInt3, int paramInt4, double paramDouble) {
    paramInt1 = paramInt3 * paramInt1 + paramInt2;
    paramInt2 = paramArrayOfint[paramInt1];
    double d2 = (paramInt2 >> 16 & 0xFF);
    double d1 = (paramInt2 >> 8 & 0xFF);
    paramInt2 = Math.min(255, Math.max(0, (int)((paramInt2 & 0xFF) * 0.114D + d1 * 0.587D + d2 * 0.299D) + (int)(paramInt4 * paramDouble)));
    paramArrayOfint[paramInt1] = paramInt2 | 0xFF000000 | paramInt2 << 16 | paramInt2 << 8;
  }
  
  private boolean checkIfBackgroundIsBlack(Bitmap paramBitmap) {
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    int k = paramBitmap.getPixel(0, 0);
    int m = paramBitmap.getPixel(--i, 0);
    int n = paramBitmap.getPixel(0, --j);
    int i1 = paramBitmap.getPixel(i, j);
    i = 0;
    for (j = 0; i < 4; j = i2) {
      (new int[4])[0] = k;
      (new int[4])[1] = m;
      (new int[4])[2] = n;
      (new int[4])[3] = i1;
      int i2 = (new int[4])[i];
      int i3 = Color.red(i2);
      int i4 = Color.green(i2);
      int i5 = Color.blue(i2);
      i2 = j;
      if (i3 < 50) {
        i2 = j;
        if (i4 < 50) {
          i2 = j;
          if (i5 < 50)
            i2 = j + 1; 
        } 
      } 
      i++;
    } 
    return (j < 3);
  }
  
  private boolean checkIfBackgroundIsBlack_10_2(Bitmap paramBitmap) {
    int i3 = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    int n = paramBitmap.getPixel(0, 0);
    int i = i3 - 1;
    int i2 = paramBitmap.getPixel(i, 0);
    int k = j - 1;
    int i1 = paramBitmap.getPixel(0, k);
    int m = paramBitmap.getPixel(i, k);
    int i4 = i3 / 2;
    i3 = paramBitmap.getPixel(i4, 0);
    i4 = paramBitmap.getPixel(i4, k);
    j /= 2;
    int i5 = paramBitmap.getPixel(0, j);
    int i6 = paramBitmap.getPixel(i, j);
    i = 0;
    for (j = 0; i < 8; j = k) {
      (new int[8])[0] = n;
      (new int[8])[1] = i2;
      (new int[8])[2] = i1;
      (new int[8])[3] = m;
      (new int[8])[4] = i3;
      (new int[8])[5] = i4;
      (new int[8])[6] = i5;
      (new int[8])[7] = i6;
      k = (new int[8])[i];
      int i8 = Color.red(k);
      int i7 = Color.green(k);
      int i9 = Color.blue(k);
      k = j;
      if (i8 < 50) {
        k = j;
        if (i7 < 50) {
          k = j;
          if (i9 < 50)
            k = j + 1; 
        } 
      } 
      i++;
    } 
    return (j >= 5);
  }
  
  private boolean checkIfBackgroundIsBlack_5_2_25(Bitmap paramBitmap) {
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    int k = paramBitmap.getPixel(0, 0);
    int m = paramBitmap.getPixel(--i, 0);
    int n = paramBitmap.getPixel(0, --j);
    int i1 = paramBitmap.getPixel(i, j);
    j = 0;
    for (i = 0; j < 4; i = i2) {
      (new int[4])[0] = k;
      (new int[4])[1] = m;
      (new int[4])[2] = n;
      (new int[4])[3] = i1;
      int i2 = (new int[4])[j];
      int i4 = Color.red(i2);
      int i3 = Color.green(i2);
      int i5 = Color.blue(i2);
      i2 = i;
      if (i4 < 50) {
        i2 = i;
        if (i3 < 50) {
          i2 = i;
          if (i5 < 50)
            i2 = i + 1; 
        } 
      } 
      j++;
    } 
    return (i >= 3);
  }
  
  public Bitmap adjustBrightness(Bitmap paramBitmap, float paramFloat) {
    ColorMatrix colorMatrix = new ColorMatrix(new float[] { 
          paramFloat, 0.0F, 0.0F, 0.0F, 0.0F, 0.0F, paramFloat, 0.0F, 0.0F, 0.0F, 
          0.0F, 0.0F, paramFloat, 0.0F, 0.0F, 0.0F, 0.0F, 0.0F, 1.0F, 0.0F });
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    Bitmap.Config config = paramBitmap.getConfig();
    Objects.requireNonNull(config);
    Bitmap bitmap = Bitmap.createBitmap(i, j, config);
    Canvas canvas = new Canvas(bitmap);
    Paint paint = new Paint();
    paint.setColorFilter((ColorFilter)new ColorMatrixColorFilter(colorMatrix));
    canvas.drawBitmap(paramBitmap, 0.0F, 0.0F, paint);
    return bitmap;
  }
  
  public void adjustPixel(Bitmap paramBitmap, int paramInt1, int paramInt2, int paramInt3, double paramDouble) {
    paramBitmap.setPixel(paramInt1, paramInt2, paramBitmap.getPixel(paramInt1, paramInt2) + (int)(paramInt3 * paramDouble));
  }
  
  public void goToNextLabel() {
    try {
      this.outputStream.write(PrinterCommands.GO_TO_NEXT_LABEL);
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public Bitmap increaseContrast(Bitmap paramBitmap, float paramFloat) {
    ColorMatrix colorMatrix = new ColorMatrix(new float[] { 
          paramFloat, 0.0F, 0.0F, 0.0F, 0.0F, 0.0F, paramFloat, 0.0F, 0.0F, 0.0F, 
          0.0F, 0.0F, paramFloat, 0.0F, 0.0F, 0.0F, 0.0F, 0.0F, 1.0F, 0.0F });
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    Bitmap.Config config = paramBitmap.getConfig();
    Objects.requireNonNull(config);
    Bitmap bitmap = Bitmap.createBitmap(i, j, config);
    Canvas canvas = new Canvas(bitmap);
    Paint paint = new Paint();
    paint.setColorFilter((ColorFilter)new ColorMatrixColorFilter(colorMatrix));
    canvas.drawBitmap(paramBitmap, 0.0F, 0.0F, paint);
    return bitmap;
  }
  
  public Bitmap prepareImageForPrint(Bitmap paramBitmap) {
    return increaseContrast(adjustBrightness(applyDithering(toGrayscale(paramBitmap)), 1.1F), 1.3F);
  }
  
  public void printBackLine() {
    try {
      this.outputStream.write(PrinterCommands.REVERSE_FEED_LINE);
      this.outputStream.flush();
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public void printNewLine() {
    try {
      this.outputStream.write(PrinterCommands.FEED_LINE);
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public void printText(String paramString) {
    try {
      this.outputStream.write(paramString.getBytes());
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public void printText(byte[] paramArrayOfbyte) {
    try {
      this.outputStream.write(paramArrayOfbyte);
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public void printUnicode() {
    try {
      this.outputStream.write(PrinterCommands.ESC_ALIGN_CENTER);
      printText(Utils.UNICODE_TEXT);
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public Bitmap processBitmapForBlackAndWhite(Bitmap paramBitmap) {
    if (checkIfBackgroundIsBlack(paramBitmap))
      return paramBitmap; 
    int j = paramBitmap.getWidth();
    int i = paramBitmap.getHeight();
    Bitmap bitmap = Bitmap.createBitmap(j, i, Bitmap.Config.ARGB_8888);
    for (byte b = 0; b < j; b++) {
      for (byte b1 = 0; b1 < i; b1++) {
        int i1 = paramBitmap.getPixel(b, b1);
        int m = Color.alpha(i1);
        int k = Color.red(i1);
        int n = Color.green(i1);
        i1 = Color.blue(i1);
        double d1 = k;
        double d2 = n;
        if ((int)(i1 * 0.11D + d2 * 0.59D + d1 * 0.3D) > 128) {
          k = 255;
        } else {
          k = 0;
        } 
        bitmap.setPixel(b, b1, Color.argb(m, k, k, k));
      } 
    } 
    return bitmap;
  }
  
  public Bitmap processBitmapForBlackAndWhite_10_2(Bitmap paramBitmap) {
    if (checkIfBackgroundIsBlack(paramBitmap))
      return paramBitmap; 
    int i = paramBitmap.getWidth();
    int k = paramBitmap.getHeight();
    int j = i * k;
    int[] arrayOfInt = new int[j];
    paramBitmap.getPixels(arrayOfInt, 0, i, 0, 0, i, k);
    for (byte b = 0; b < j; b++) {
      int i2 = arrayOfInt[b];
      int n = Color.alpha(i2);
      int i1 = Color.red(i2);
      int m = Color.green(i2);
      i2 = Color.blue(i2);
      double d2 = i1;
      double d1 = m;
      if ((int)(i2 * 0.11D + d1 * 0.59D + d2 * 0.3D) > 128) {
        m = 255;
      } else {
        m = 0;
      } 
      arrayOfInt[b] = Color.argb(n, m, m, m);
    } 
    paramBitmap = Bitmap.createBitmap(i, k, Bitmap.Config.ARGB_8888);
    paramBitmap.setPixels(arrayOfInt, 0, i, 0, 0, i, k);
    return paramBitmap;
  }
  
  public Bitmap processBitmapForBlackAndWhite_5_2_24(Bitmap paramBitmap) {
    if (checkIfBackgroundIsBlack(paramBitmap))
      return paramBitmap; 
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    Bitmap bitmap = Bitmap.createBitmap(i, j, Bitmap.Config.ARGB_8888);
    for (byte b = 0; b < i; b++) {
      for (byte b1 = 0; b1 < j; b1++) {
        int i1 = paramBitmap.getPixel(b, b1);
        int m = Color.alpha(i1);
        int k = Color.red(i1);
        int n = Color.green(i1);
        i1 = Color.blue(i1);
        double d1 = k;
        double d2 = n;
        if ((int)(i1 * 0.11D + d2 * 0.59D + d1 * 0.3D) > 128) {
          k = 200;
        } else {
          k = 50;
        } 
        k = 255 - k;
        bitmap.setPixel(b, b1, Color.argb(m, k, k, k));
      } 
    } 
    return bitmap;
  }
  
  public boolean queryPrinterStatus() {
    this.outputStream.write(PrinterCommands.PRINTER_STATUS);
    this.outputStream.flush();
    try {
      Thread.sleep(100L);
    } catch (InterruptedException interruptedException) {
      interruptedException.printStackTrace();
    } 
    int i = this.inputStream.read();
    if (i == 1) {
      System.out.println("Printer is OUT OF PAPER");
      return true;
    } 
    if (i == 0) {
      System.out.println("Printer is IDLE (Ready)");
      return false;
    } 
    if (i == -1) {
      System.out.println("No response received from printer");
    } else {
      System.out.printf("Unknown response: 0x%02X\n", new Object[] { Integer.valueOf(i) });
    } 
    return false;
  }
  
  public Bitmap resizeBitmap(Bitmap paramBitmap) {
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    if (i <= 440 && j <= 440)
      return paramBitmap; 
    float f3 = 'Ƹ';
    float f1 = i;
    float f4 = f3 / f1;
    float f2 = j;
    f3 = Math.min(f4, f3 / f2);
    return Bitmap.createScaledBitmap(paramBitmap, Math.round(f1 * f3), Math.round(f2 * f3), true);
  }
  
  public Bitmap resizeBitmap1(Bitmap paramBitmap) {
    int j = paramBitmap.getWidth();
    int i = paramBitmap.getHeight();
    float f2 = 'Ǵ';
    float f1 = j;
    float f3 = f2 / f1;
    f2 = i;
    f3 = Math.min(f3, f2);
    j = Math.round(f1 * f3);
    Math.round(f2 * f3);
    return Bitmap.createScaledBitmap(paramBitmap, j, i, true);
  }
  
  public Bitmap resizeBitmapOLD(Bitmap paramBitmap, int paramInt1, int paramInt2) {
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    float f2 = paramInt1;
    float f1 = i;
    float f3 = f2 / f1;
    float f4 = paramInt2;
    f2 = j;
    f3 = Math.min(f3, f4 / f2);
    return Bitmap.createScaledBitmap(paramBitmap, Math.round(f1 * f3), Math.round(f2 * f3), true);
  }
  
  public Bitmap resizeBitmap_10_2_25(Bitmap paramBitmap) {
    paramBitmap = processBitmapForBlackAndWhite(paramBitmap);
    int j = paramBitmap.getWidth();
    int i = paramBitmap.getHeight();
    if (j <= 450 && i <= 450)
      return paramBitmap; 
    float f4 = 'ǂ';
    float f1 = j;
    float f3 = f4 / f1;
    float f2 = i;
    f3 = Math.min(f3, f4 / f2);
    return Bitmap.createScaledBitmap(paramBitmap, Math.round(f1 * f3), Math.round(f2 * f3), true);
  }
  
  public Bitmap resizeBitmap_10_2_25_1(Bitmap paramBitmap) {
    int i = paramBitmap.getWidth();
    int j = paramBitmap.getHeight();
    if (i <= 450 && j <= 130)
      return paramBitmap; 
    float f2 = 'ǂ';
    float f1 = i;
    float f3 = f2 / f1;
    float f4 = '';
    f2 = j;
    f3 = Math.max(f3, f4 / f2);
    i = Math.round(f1 * f3);
    j = Math.round(f2 * f3);
    return Bitmap.createBitmap(Bitmap.createScaledBitmap(paramBitmap, i, j, true), (i - 450) / 2, (j - 130) / 2, 450, 130);
  }
  
  public void sendCommand(byte[] paramArrayOfbyte) {
    try {
      this.outputStream.write(paramArrayOfbyte);
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public void setPaperType(int paramInt) {
    try {
      this.outputStream.write(PrinterCommands.setPaperType(paramInt));
      return;
    } catch (IOException iOException) {
      iOException.printStackTrace();
      return;
    } 
  }
  
  public Bitmap toGrayscale(Bitmap paramBitmap) {
    int i = paramBitmap.getHeight();
    Bitmap bitmap = Bitmap.createBitmap(paramBitmap.getWidth(), i, Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(bitmap);
    Paint paint = new Paint();
    ColorMatrix colorMatrix = new ColorMatrix();
    colorMatrix.setSaturation(0.0F);
    paint.setColorFilter((ColorFilter)new ColorMatrixColorFilter(colorMatrix));
    canvas.drawBitmap(paramBitmap, 0.0F, 0.0F, paint);
    return bitmap;
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\PrinterSDK.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */