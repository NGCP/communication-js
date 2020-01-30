import SerialPort from 'serialport';
import * as XBeeAPI from 'xbee-api';

export default class XBee {
  /** Callback function when xbee port connection opens */
  private onOpen?: () => void;

  /** Callback function when xbee connection closes */
  private onClose?: () => void;

  /** Callback function when xbee connection fails to open/close */
  private onFailure?: (error?: Error) => void;

  /** Callback function when xbee connection encounters an error */
  private onError?: (error: Error) => void;

  private serialport: SerialPort;

  private xbee: XBeeAPI.XBeeAPI;

  /**
   * Creates an instance of an xbee and opens connection.
   *
   * @param port The port the xbee will be connected to.
   * @param options Additional options for the xbee
   * @param onOpen Callback function when xbee port connection opens
   * @param onClose Callback function when xbee connection closes
   * @param onFailure Callback function when xbee connection fails to open/close
   * @param onError Callback function when xbee connection encounters an error
   */
  public constructor(
    port: string,
    options?: SerialPort.OpenOptions,
    onOpen?: () => void,
    onClose?: () => void,
    onFailure?: (error?: Error) => void,
    onError?: (error: Error) => void,
  ) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onFailure = onFailure;
    this.onError = onError;

    this.serialport = new SerialPort(port, options, this.failureCallback);
    this.xbee = new XBeeAPI.XBeeAPI();
    this.serialport.pipe(this.xbee.parser);
    this.xbee.builder.pipe(this.serialport as NodeJS.WritableStream);

    this.serialport.on('open', () => this.onOpen);
    this.serialport.on('close', () => this.onClose);
    this.serialport.on('error', (error: Error) => {
      if (this.onError) {
        this.onError(error);
      }
    });
  }

  public openConnection(): boolean {
    if (this.serialport.isOpen) return false;
    this.serialport.open(this.failureCallback);
    return true;
  }

  public closeConnection(): boolean {
    if (!this.serialport.isOpen) return false;
    this.serialport.open(this.failureCallback);
    return true;
  }

  private failureCallback(error?: Error | null): void {
    if (error && this.onFailure) {
      this.onFailure(error);
    }
  }
}
