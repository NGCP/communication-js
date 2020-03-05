declare module '@serialport/binding-mock' {
  import SerialPort from '@serialport/stream';
  import AbstractBinding from '@serialport/binding-abstract';

  export default class MockBinding extends AbstractBinding {
    // if record is true this buffer will have all data that has been written to this port
    readonly recording: Buffer;

    // the buffer of the latest written data
    readonly lastWrite: null | Buffer;

    // Create a mock port
    static createPort(
      path: string,
      opt: { echo?: boolean; record?: boolean; readyData?: Buffer }
    ): void;

    // Reset available mock ports
    static reset(): void;

    // list mock ports
    static list(): Promise<SerialPort.PortInfo[]>;

    // Emit data on a mock port
    emitData(data: Buffer | string | number[]): void;

    // Standard bindings interface
    open(path: string, opt: SerialPort.OpenOptions): Promise<void>;

    close(): Promise<void>;

    read(
      buffer: Buffer,
      offset: number,
      length: number,
    ): Promise<{ bytesRead: number; buffer: Buffer }>;

    write(buffer: Buffer): Promise<void>;

    update(options: { baudRate: number }): Promise<void>;

    set(options: object): Promise<void>;

    get(): Promise<object>;

    getBaudRate(): Promise<number>;

    flush(): Promise<void>;

    drain(): Promise<void>;
  }
}
