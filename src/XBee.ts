import msgpack from 'msgpack-lite';
import SerialPort from '@serialport/stream';
import XBeeAPI from 'xbee-api';

export default class XBee {
  /** Callback function when xbee receives a zigbee packet from another xbee */
  private onReceiveObject: (obj: object) => void;

  /** Callback function when xbee port connection opens */
  private onOpen: () => void;

  /** Callback function when xbee connection closes */
  private onClose: () => void;

  /** Callback function when xbee connection encounters an error */
  private onError: (error?: Error | null) => void;

  serialport: SerialPort;

  xbee: XBeeAPI.XBeeAPI;

  /**
   * Creates an instance of an xbee and opens connection.
   *
   * @param port The port the xbee will be connected to
   * @param options Additional options for the xbee
   * @param onReceiveObject Callback function when xbee receives a non-null object
   * @param onOpen Callback function when xbee port connection opens
   * @param onClose Callback function when xbee connection closes
   * @param onError Callback function when xbee connection encounters an error
   */
  public constructor(
    port: string,
    options: SerialPort.OpenOptions,
    onReceiveObject: (obj: object) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (error?: Error | null) => void,
  ) {
    this.onReceiveObject = onReceiveObject;
    this.onOpen = (): void => {
      if (onOpen) {
        onOpen();
      }
    };
    this.onClose = (): void => {
      if (onClose) {
        onClose();
      }
    };
    this.onError = (error): void => {
      if (onError) {
        onError(error);
      }
    };

    // Create port and bind xbee-api to it
    this.serialport = new SerialPort(
      port,
      { autoOpen: true, baudRate: 57600, ...options },
      (error) => {
        if (error !== undefined && error !== null) {
          this.onError(error);
        }
      },
    );
    this.xbee = new XBeeAPI.XBeeAPI();
    this.serialport.pipe(this.xbee.parser);
    this.xbee.builder.pipe(this.serialport as NodeJS.WritableStream);

    this.serialport.on('open', () => this.onOpen());
    this.serialport.on('close', () => this.onClose());
    this.serialport.on('error', (error) => this.onError(error));
    this.xbee.parser.on('data', (frame) => this.onReceiveFrame(frame));
  }

  public openConnection(): void {
    if (this.serialport.isOpen) {
      this.onError(new Error('XBee connection already open'));
      return;
    }
    this.serialport.open((error) => this.onError(error));
  }

  public closeConnection(): void {
    if (!this.serialport.isOpen) {
      this.onError(new Error('XBee connection already close'));
      return;
    }
    this.serialport.close((error) => this.onError(error));
  }

  /**
   * Sends JSON compressed using MessagePack https://msgpack.org/index.html
   * Sends packet as a ZigBee transmit request
   *
   * @param obj The object being sent, will be compressed with MessagePack
   * @param address 64-bit MAC address of the XBee that the message is being sent to
   * @returns generate frame from provided object and address
   */
  public sendObject(obj: object, address: string): XBeeAPI.Frame | undefined {
    if (!this.serialport.isOpen) {
      this.onError(new Error('XBee connection is not open'));
      return undefined;
    }

    const frame: XBeeAPI.Frame = {
      type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
      destination64: address,
      data: msgpack.encode(JSON.stringify(obj)),
    };

    return this.xbee.builder.write(frame) ? frame : undefined;
  }

  /**
   * Invoked when something is received on our xbee's end. Will only run provided onReceiveData
   * function if the data received is a ZigBee receive packet and is a valid MessagePack-encoded
   * JSON
   */
  onReceiveFrame(frame: XBeeAPI.Frame): object | undefined {
    if (frame.type === XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET) {
      if (frame.data !== undefined) {
        try {
          const obj = JSON.parse(msgpack.decode(frame.data));
          if (typeof obj === 'object') {
            this.onReceiveObject(obj);
            return obj;
          }
        } catch (e) {
          return undefined;
        }
      }
    }
    return undefined;
  }
}
