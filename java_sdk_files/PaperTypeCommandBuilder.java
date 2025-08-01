package com.labelprinter;

public class PaperTypeCommandBuilder {
  private static byte[] buildPaperSpecCommand(int paramInt1, int paramInt2, int paramInt3) {
    byte b1 = (byte)(paramInt3 % 256);
    byte b3 = (byte)(paramInt3 / 256);
    paramInt1 *= 10;
    byte b2 = (byte)(paramInt1 % 256);
    byte b4 = (byte)(paramInt1 / 256);
    paramInt1 = paramInt2 * 10;
    return new byte[] { 27, 41, b1, b3, b2, b4, (byte)(paramInt1 % 256), (byte)(paramInt1 / 256), 30 };
  }
  
  public static byte[] getPaperSpec_50x25() {
    return buildPaperSpecCommand(50, 25, 200);
  }
  
  public static byte[] getPaperSpec_50x30() {
    return buildPaperSpecCommand(50, 30, 240);
  }
  
  public static byte[] getPaperSpec_50x50() {
    return buildPaperSpecCommand(50, 50, 400);
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\PaperTypeCommandBuilder.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */