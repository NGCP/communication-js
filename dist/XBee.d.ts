import SerialPort from 'serialport';
export default class XBee {
    /** Callback function when xbee receives a zigbee packet from another xbee */
    private onReceiveObject;
    /** Callback function when xbee port connection opens */
    private onOpen?;
    /** Callback function when xbee connection closes */
    private onClose?;
    /** Callback function when xbee connection fails to open/close */
    private onFailure?;
    /** Callback function when xbee connection encounters an error */
    private onError?;
    private serialport;
    private xbee;
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
    constructor(port: string, options: SerialPort.OpenOptions, onReceiveObject: (obj: object) => void, onOpen?: () => void, onClose?: () => void, onFailure?: (error?: Error) => void, onError?: (error: Error) => void);
    openConnection(): boolean;
    closeConnection(): boolean;
    /**
     * Sends JSON compressed using MessagePack https://msgpack.org/index.html
     * Sends packet as a ZigBee transmit request
     *
     * @param data The object being sent, will be compressed with MessagePack
     * @param address 64-bit MAC address of the XBee that the message is being sent to
     */
    sendData(data: object, address: string): void;
    private failureCallback;
}
