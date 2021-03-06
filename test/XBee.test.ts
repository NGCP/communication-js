import SerialPort from '@serialport/stream';
import MockBinding from '@serialport/binding-mock';
import { assert } from 'chai';
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha';
import msgpack from 'msgpack-lite';
import sinon from 'sinon';
import XBeeAPI from 'xbee-api';

import XBee from '../src/XBee';

const PORT = 'PORT';

function emptyFunction(): void { // eslint-disable @typescript-eslint/no-empty-function
}

let xbee: XBee | undefined;

SerialPort.Binding = MockBinding as unknown as SerialPort.BaseBinding;
MockBinding.createPort(PORT, {});

describe('XBee', () => {
  beforeEach(() => {
    xbee = undefined;
  });

  afterEach(() => {
    if (xbee !== undefined && xbee.serialport.isOpen) {
      xbee.serialport.close();
    }
  });

  describe('#constructor()', () => {
    it('should call onOpen callback function when connection opens on construction', (done) => {
      const onOpen = (): void => {
        if (xbee !== undefined) {
          assert.isTrue(xbee.serialport.isOpen, 'onOpen called but connection is not open');
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, onOpen);
    });

    it('should call onClose callback function when connection closes', (done) => {
      const onOpen = (): void => {
        if (xbee !== undefined) {
          xbee.serialport.close();
        }
      };
      const onClose = (): void => {
        if (xbee !== undefined) {
          assert.isFalse(xbee.serialport.isOpen, 'onClose called but connection is open');
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, onOpen, onClose);
    });

    it('should call onError callback function if it gets an error', (done) => {
      const onError = (): void => done();
      xbee = new XBee(PORT, {}, emptyFunction, emptyFunction, emptyFunction, onError);

      xbee.serialport.emit('error');
    });

    it('should have proper error message when onError callback function is called', (done) => {
      const onError = (error?: Error | null): void => {
        assert.isDefined(error);
        assert.equal((error as Error).message, 'error message');
        done();
      };
      xbee = new XBee(PORT, {}, emptyFunction, emptyFunction, emptyFunction, onError);
      xbee.serialport.emit('error', new Error('error message'));
    });

    it('should call an error if port defined does not exist', (done) => {
      const onOpen = (): void => done(
        new Error('xbee connection should not have opened as port does not exist'),
      );
      const onError = (): void => done();

      xbee = new XBee('INVALID PORT', {}, emptyFunction, onOpen, emptyFunction, onError);
    });
  });

  describe('#openConnection()', () => {
    it('should open connection if it is currently closed', (done) => {
      xbee = new XBee(PORT, {}, emptyFunction);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isTrue(xbee.serialport.isOpen, 'xbee connection is not open yet');
          xbee.serialport.close();
        }
      }, 10);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isFalse(xbee.serialport.isOpen, 'xbee connection is not closed yet');
          xbee.openConnection();
        }
      }, 20);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isTrue(xbee.serialport.isOpen, 'xbee connection should be open now');
          done();
        }
      }, 30);
    });

    it('should not open connection if it is already open', (done) => {
      const onError = (error?: Error | null): void => {
        if (xbee !== undefined) {
          assert.isDefined(error);
          assert.equal((error as Error).message, 'XBee connection already open');
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, emptyFunction, emptyFunction, onError);
      setTimeout(() => {
        if (xbee !== undefined) {
          xbee.openConnection();
        }
      }, 10);
    });
  });

  describe('#closeConnection()', () => {
    it('should close connection if it is currently open', (done) => {
      xbee = new XBee(PORT, {}, emptyFunction);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isTrue(xbee.serialport.isOpen, 'xbee connection is not open yet');
          xbee.closeConnection();
        }
      }, 10);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isFalse(xbee.serialport.isOpen, 'xbee connection should be closed now');
          done();
        }
      }, 20);
    });

    it('should not close connection if it is already closed', (done) => {
      const onError = (error?: Error | null): void => {
        if (xbee !== undefined) {
          assert.isDefined(error);
          assert.equal((error as Error).message, 'XBee connection already close');
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, emptyFunction, emptyFunction, onError);
      setTimeout(() => {
        if (xbee !== undefined) {
          assert.isTrue(xbee.serialport.isOpen, 'xbee connection is not open yet');
          xbee.serialport.close();
        }
      }, 10);
      setTimeout(() => {
        if (xbee !== undefined) {
          xbee.closeConnection();
        }
      }, 20);
    });
  });

  describe('#sendObject()', () => {
    it('should not send data if connection is closed', (done) => {
      const onOpen = (): void => {
        if (xbee) {
          xbee.serialport.close();
        }
      };
      const onClose = (): void => {
        if (xbee) {
          xbee.sendObject({}, '');
        }
      };
      const onError = (error?: Error | null): void => {
        assert.isDefined(error);
        assert.equal((error as Error).message, 'XBee connection is not open');
        done();
      };

      xbee = new XBee(PORT, {}, emptyFunction, onOpen, onClose, onError);
    });

    it('should generate proper message frame from given data', (done) => {
      const obj = { a: 'test', b: 2, c: false };
      const macAddress = 'TEST';
      const onOpen = (): void => {
        if (xbee) {
          const frame = xbee.sendObject(obj, macAddress);
          assert.isDefined(frame);

          const definedFrame = frame as XBeeAPI.Frame;
          assert.equal(definedFrame.type, XBeeAPI.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST);
          assert.isDefined(definedFrame.data, 'frame data is undefined');
          assert.equal(msgpack.decode(definedFrame.data as Buffer), JSON.stringify(obj));
          assert.equal(definedFrame.destination64, macAddress);
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, onOpen);
    });

    it('should return undefined if xbee fails to send data', (done) => {
      const obj = { a: 'test', b: 2, c: false };
      const macAddress = 'TEST';
      const onOpen = (): void => {
        if (xbee) {
          sinon.stub(xbee.xbee.builder, 'write').returns(false);
          const frame = xbee.sendObject(obj, macAddress);
          assert.isUndefined(frame);
          done();
        }
      };

      xbee = new XBee(PORT, {}, emptyFunction, onOpen);
    });
  });

  describe('#onReceiveFrame()', () => {
    it('should return obj for frames with valid data', () => {
      xbee = new XBee(PORT, {}, emptyFunction);
      const obj = { a: 1 };
      const obj2 = xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: msgpack.encode(JSON.stringify(obj)),
      });

      assert.deepEqual(obj, obj2);
    });

    it('should return undefined for empty frames', () => {
      xbee = new XBee(PORT, {}, emptyFunction);
      assert.isUndefined(xbee.onReceiveFrame({}));
    });

    it('should return undefined for frames with wrong type', () => {
      xbee = new XBee(PORT, {}, emptyFunction);
      assert.isUndefined(xbee.onReceiveFrame({}));
      assert.isUndefined(xbee.onReceiveFrame({ type: 0 }));
    });

    it('should return undefined for frames with no data', () => {
      xbee = new XBee(PORT, {}, emptyFunction);
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
      }));
    });

    it('should return undefined for frames with invalid data', () => {
      xbee = new XBee(PORT, {}, emptyFunction);
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: 10 as unknown as Buffer,
      }));
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: Buffer.from([0x10]),
      }));
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: Buffer.from(JSON.stringify({ a: 1 })),
      }));
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: null as unknown as Buffer,
      }));
      assert.isUndefined(xbee.onReceiveFrame({
        type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET,
        data: msgpack.encode({ a: 1 }),
      }));
    });
  });
});
