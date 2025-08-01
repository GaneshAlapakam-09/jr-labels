declare module 'react-native-bluetooth-escpos-printer' {
  interface Device {
    name: string;
    address: string;
  }

  interface PrintConfig {
    encoding?: string;
    codepage?: number;
    widthtimes?: number;
    heigthtimes?: number;
    fonttype?: number;
  }

  const BluetoothEscposPrinter: {
    // Device Methods
    list(): Promise<Device[]>;
    connect(address: string): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;

    // Printing Methods
    printerInit(): Promise<void>;
    setPrintMode(mode: number): Promise<void>;
    printText(text: string, config?: PrintConfig): Promise<void>;
    printColumn(columnWidths: number[], columnAligns: number[], columnTexts: string[], config?: PrintConfig): Promise<void>;
    cutPaper(mode?: number): Promise<void>;
    printImage(base64Image: string, width?: number): Promise<void>;
    printQRCode(content: string, size?: number, correctionLevel?: number): Promise<void>;
    printBarCode(
      content: string,
      barcodeType: number,
      width: number,
      height: number,
      textPosition: number
    ): Promise<void>;

    // Advanced
    printOriginalText(text: string): Promise<void>;
    printBuffer(buffer: number[]): Promise<void>;
  };

  export default BluetoothEscposPrinter;
}