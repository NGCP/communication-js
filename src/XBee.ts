import msgpack from 'msgpack-lite';
import SerialPort from 'serialport';
import * as XBeeAPI from 'xbee-api';

export default class XBee {
  /** Callback function when xbee receives a zigbee packet from another xbee */
  private onReceiveObject: (obj: object) => void;

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
   * @param port The port the xbee will be connected to
   * @param options Additional options for the xbee
   * @param onReceiveObject Callback function when xbee receives a non-null object
   * @param onOpen Callback function when xbee port connection opens
   * @param onClose Callback function when xbee connection closes
   * @param onFailure Callback function when xbee connection fails to open/close
   * @param onError Callback function when xbee connection encounters an error
   */
  public constructor(
    port: string,
    options: SerialPort.OpenOptions,
    onReceiveObject: (obj: object) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onFailure?: (error?: Error) => void,
    onError?: (error: Error) => void,
  ) {
    this.onReceiveObject = onReceiveObject;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onFailure = onFailure;
    this.onError = onError;

    // Create port and bind xbee-api to it
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

    // Will only run onReceiveData function if the data received is a ZigBee receive packet
    // and is a valid MessagePack-encoded JSON
    this.xbee.parser.on('data', (frame): void => {
      if (frame.type === XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET) {
        try {
          const obj = JSON.parse(msgpack.decode(frame.data));
          if (typeof obj === 'object' && obj !== null) {
            this.onReceiveObject(obj);
          }
        } catch (e) {
          // eslint-disable-line no-empty
        }
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

  /**
   * Sends JSON compressed using MessagePack https://msgpack.org/index.html
   * Sends packet as a ZigBee transmit request
   *
   * @param data The object being sent, will be compressed with MessagePack
   * @param address 64-bit MAC address of the XBee that the message is being sent to
   */
  public sendData(data: object, address: string): void {
    if (!this.serialport.isOpen) return;

    this.xbee.builder.write({
      type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
      destination64: address,
      data: msgpack.encode(JSON.stringify(data)),
    });
  }

  private failureCallback(error?: Error | null): void {
    if (error && this.onFailure) {
      this.onFailure(error);
    }
  }
}
