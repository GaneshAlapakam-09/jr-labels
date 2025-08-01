package com.labelprinter;

public class PrinterCommands {
  public static final byte CAN = 24;
  
  public static final byte CLR = 12;
  
  public static final byte CR = 13;
  
  public static final byte DLE = 16;
  
  public static final byte EOT = 4;
  
  public static final byte ESC = 27;
  
  public static final byte[] ESC_ALIGN_CENTER;
  
  public static final byte[] ESC_ALIGN_LEFT;
  
  public static final byte[] ESC_ALIGN_RIGHT;
  
  public static final byte[] ESC_CANCEL_BOLD;
  
  public static final byte[] ESC_CANCLE_HORIZONTAL_CENTERS;
  
  public static final byte[] ESC_ENTER;
  
  public static final byte[] ESC_FONT_COLOR_DEFAULT;
  
  public static final byte[] ESC_HORIZONTAL_CENTERS;
  
  public static final byte[] FEED_LINE;
  
  public static byte[] FEED_PAPER_AND_CUT;
  
  public static final byte FS = 28;
  
  public static final byte[] FS_FONT_ALIGN;
  
  public static final byte[] GO_TO_NEXT_LABEL;
  
  public static final byte GS = 29;
  
  public static final byte HT = 9;
  
  public static final byte[] INIT = new byte[] { 27, 64 };
  
  public static final byte LF = 10;
  
  public static final byte[] PRINTER_STATUS;
  
  public static final byte[] PRINTE_TEST;
  
  public static byte[] PRINT_BAR_CODE_1;
  
  public static final byte[] REVERSE_FEED_LINE;
  
  public static byte[] SELECT_BIT_IMAGE_MODE;
  
  public static byte[] SELECT_CYRILLIC_CHARACTER_CODE_TABLE;
  
  public static byte[] SELECT_FONT_A;
  
  public static byte[] SELECT_PRINT_SHEET;
  
  public static byte[] SEND_NULL_BYTE;
  
  public static byte[] SET_BAR_CODE_HEIGHT;
  
  public static byte[] SET_LINE_SPACING_24;
  
  public static byte[] SET_LINE_SPACING_30;
  
  public static final byte STX = 2;
  
  public static byte[] TRANSMIT_DLE_ERROR_STATUS;
  
  public static byte[] TRANSMIT_DLE_OFFLINE_PRINTER_STATUS;
  
  public static byte[] TRANSMIT_DLE_PRINTER_STATUS;
  
  public static byte[] TRANSMIT_DLE_ROLL_PAPER_SENSOR_STATUS;
  
  public static final byte US = 31;
  
  static {
    FEED_LINE = new byte[] { 10 };
    REVERSE_FEED_LINE = new byte[] { 27, 41 };
    SELECT_FONT_A = new byte[] { 20, 33, 0 };
    SET_BAR_CODE_HEIGHT = new byte[] { 29, 104, 100 };
    PRINT_BAR_CODE_1 = new byte[] { 29, 107, 2 };
    SEND_NULL_BYTE = new byte[] { 0 };
    SELECT_PRINT_SHEET = new byte[] { 27, 99, 48, 2 };
    FEED_PAPER_AND_CUT = new byte[] { 29, 86, 66, 0 };
    SELECT_CYRILLIC_CHARACTER_CODE_TABLE = new byte[] { 27, 116, 17 };
    SELECT_BIT_IMAGE_MODE = new byte[] { 27, 42, 33, Byte.MIN_VALUE, 0 };
    SET_LINE_SPACING_24 = new byte[] { 27, 51, 24 };
    SET_LINE_SPACING_30 = new byte[] { 27, 51, 30 };
    TRANSMIT_DLE_PRINTER_STATUS = new byte[] { 16, 4, 1 };
    TRANSMIT_DLE_OFFLINE_PRINTER_STATUS = new byte[] { 16, 4, 2 };
    TRANSMIT_DLE_ERROR_STATUS = new byte[] { 16, 4, 3 };
    TRANSMIT_DLE_ROLL_PAPER_SENSOR_STATUS = new byte[] { 16, 4, 4 };
    ESC_FONT_COLOR_DEFAULT = new byte[] { 27, 114, 0 };
    FS_FONT_ALIGN = new byte[] { 28, 33, 1, 27, 33, 1 };
    ESC_ALIGN_LEFT = new byte[] { 27, 97, 0 };
    ESC_ALIGN_RIGHT = new byte[] { 27, 97, 2 };
    ESC_ALIGN_CENTER = new byte[] { 27, 97, 1 };
    ESC_CANCEL_BOLD = new byte[] { 27, 69, 0 };
    ESC_HORIZONTAL_CENTERS = new byte[] { 27, 68, 20, 28, 0 };
    ESC_CANCLE_HORIZONTAL_CENTERS = new byte[] { 27, 68, 0 };
    ESC_ENTER = new byte[] { 27, 74, 64 };
    PRINTE_TEST = new byte[] { 29, 40, 65 };
    GO_TO_NEXT_LABEL = new byte[] { 27, 105 };
    PRINTER_STATUS = new byte[] { 27, 118 };
  }
  
  public static byte[] setPaperType(int paramInt) {
    return new byte[] { 28, 37, (byte)paramInt };
  }
}


/* Location:              C:\Users\Surya\Downloads\dex2jar-v2\dex2jar-v2.3\classes-dex2jar.jar!\com\caysn\shreyanseasylabel\sdk\PrinterCommands.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */