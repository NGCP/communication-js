import SerialPort from '@serialport/stream';
import MockBinding from '@serialport/binding-mock';
import { assert } from 'chai';
import {
  afterEach,
  before,
  beforeEach,
  describe,
  it,
} from 'mocha';
import sinon from 'sinon';
import XBeeAPI from 'xbee-api';

import * as config from '../src/config/config';
import * as Message from '../src/types/message';
import * as Misc from '../src/types/misc';
import * as Task from '../src/types/task';
import Messenger from '../src/Messenger';
import { Handler } from '../src/UpdateHandler';

const PORT = 'PORT';
const SOURCE_VEHICLE_ID = 0;
const TARGET_VEHICLE_ID = 100;
const TARGET_VEHICLE_2_ID = 101;
const INVALID_VEHICLE_ID = -1;
const MESSAGE_ID = 0;
const TIME = 100000;
const DISCONNECTION_TIME = 20;
const MESSAGE_SEND_RATE = 10;

const JOB_TYPE: Misc.JobType = 'isrSearch';
const TASK: Task.LoiterTask = {
  taskType: 'loiter',
  lat: 0,
  lng: 0,
  alt: 0,
  radius: 0,
  direction: 0,
};
const VEHICLE_STATUS: Misc.VehicleStatus = 'ready';
const START_MESSAGE: Message.StartMessage = { type: 'start', jobType: JOB_TYPE };
const ADD_MISSION_MESSAGE: Message.AddMissionMessage = { type: 'addMission', missionInfo: TASK };
const PAUSE_MESSAGE: Message.PauseMessage = { type: 'pause' };
const RESUME_MESSAGE: Message.ResumeMessage = { type: 'resume' };
const STOP_MESSAGE: Message.StopMessage = { type: 'stop' };
const CONNECTION_ACKNOWLEDGEMENT_MESSAGE: Message.ConnectionAcknowledgementMessage = {
  type: 'connectionAck',
};
const UPDATE_MESSAGE: Message.UpdateMessage = {
  type: 'update',
  lat: 0,
  lng: 0,
  status: VEHICLE_STATUS,
};
const POI_MESSAGE: Message.POIMessage = { type: 'poi', lat: 0, lng: 0 };
const COMPLETE_MESSAGE: Message.CompleteMessage = { type: 'complete' };
const CONNECT_MESSAGE: Message.ConnectMessage = { type: 'connect', jobsAvailable: [JOB_TYPE] };

let messenger: Messenger;
let xbeeSendObjectSpy: sinon.SinonSpy<[object, string], XBeeAPI.Frame | undefined>;
let updateHandlerAddHandlerSpy: sinon.SinonSpy<[
  string,
  (value: unknown, options?: object) => void,
  (value: unknown, options?: object) => boolean,
  number?,
  (() => void)?,
], Handler<unknown>>;

SerialPort.Binding = MockBinding as unknown as SerialPort.BaseBinding;
MockBinding.createPort(PORT, {});

/* eslint-disable @typescript-eslint/no-empty-function */
function emptyFunction(): void {
}

function getSentMessage(index: number): Message.JSONMessage {
  assert.isTrue(xbeeSendObjectSpy.args.length > index);
  const message = xbeeSendObjectSpy.args[index][0];
  assert.isTrue(Message.isJSONMessage(message));
  return message as Message.JSONMessage;
}

function jsonMessage(
  messageId: number,
  sourceVehicleId: number,
  targetVehicleId: number,
  message: Message.Message,
): Message.JSONMessage {
  return {
    id: messageId,
    sid: sourceVehicleId,
    tid: targetVehicleId,
    time: TIME,
    ...message,
  };
}

function assertAcknowledged(messageIndex: number, message: Message.JSONMessage): void {
  const ackMessage = jsonMessage(
    MESSAGE_ID + messageIndex,
    message.tid,
    message.sid,
    { type: 'ack', ackid: message.id },
  );
  assert.deepEqual(ackMessage, getSentMessage(messageIndex));
}

describe('Messenger', () => {
  before(() => {
    // Add fake values in
    sinon.stub(Date, 'now').returns(TIME);
    sinon.replace(config, 'disconnectionTimeMs', DISCONNECTION_TIME);
    sinon.replace(config, 'messageSendRateMs', MESSAGE_SEND_RATE);
  });

  beforeEach(() => {
    messenger = new Messenger(PORT, SOURCE_VEHICLE_ID, {});

    // Spy on any calls to certain functions
    xbeeSendObjectSpy = sinon.spy(messenger.xbee, 'sendObject');
    updateHandlerAddHandlerSpy = sinon.spy(messenger.updateHandler, 'addHandler');
  });

  afterEach(() => {
    messenger.stopSendingMessages();
    messenger.xbee.closeConnection();

    xbeeSendObjectSpy.resetHistory();
    updateHandlerAddHandlerSpy.resetHistory();
  });

  describe('#generateHash', () => {
    it('should generate correct hash', () => {
      const hash = Messenger.generateHash(TARGET_VEHICLE_ID, MESSAGE_ID);
      assert.equal(hash, `${TARGET_VEHICLE_ID}#${MESSAGE_ID}`);
    });
  });

  describe('#constructor()', () => {
    it('should not set callbacks on construction', () => {
      assert.isUndefined(messenger.onStartMessage);
      assert.isUndefined(messenger.onAddMissionMessage);
      assert.isUndefined(messenger.onPauseMessage);
      assert.isUndefined(messenger.onResumeMessage);
      assert.isUndefined(messenger.onStopMessage);
      assert.isUndefined(messenger.onUpdateMessage);
      assert.isUndefined(messenger.onPOIMessage);
      assert.isUndefined(messenger.onCompleteMessage);
      assert.isUndefined(messenger.onConnectMessage);
      assert.isUndefined(messenger.onBadMessage);
      assert.isUndefined(messenger.onReceiveInvalidObject);
    });
  });

  describe('#sendStartMessage()', () => {
    it('should send message', () => {
      messenger.sendStartMessage(TARGET_VEHICLE_ID, JOB_TYPE);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, START_MESSAGE),
      );
    });
  });

  describe('#sendAddMissionMessage()', () => {
    it('should send message', () => {
      messenger.sendAddMissionMessage(TARGET_VEHICLE_ID, TASK);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, ADD_MISSION_MESSAGE),
      );
    });
  });

  describe('#sendPauseMessage()', () => {
    it('should send message', () => {
      messenger.sendPauseMessage(TARGET_VEHICLE_ID);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, PAUSE_MESSAGE),
      );
    });
  });

  describe('#sendResumeMessage()', () => {
    it('should send message', () => {
      messenger.sendResumeMessage(TARGET_VEHICLE_ID);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, RESUME_MESSAGE),
      );
    });
  });

  describe('#sendStopMessage()', () => {
    it('should send message', () => {
      messenger.sendStopMessage(TARGET_VEHICLE_ID);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, STOP_MESSAGE),
      );
    });
  });

  describe('#sendUpdateMessage()', () => {
    it('should send message when no optional fields are provided', () => {
      messenger.sendUpdateMessage(TARGET_VEHICLE_ID, 0, 0, VEHICLE_STATUS);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, UPDATE_MESSAGE),
      );
    });

    it('should send message when optional altitude field is given', () => {
      messenger.sendUpdateMessage(TARGET_VEHICLE_ID, 0, 0, VEHICLE_STATUS, { alt: 0 });
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, {
          alt: 0,
          ...UPDATE_MESSAGE,
        }),
      );
    });

    it('should send message when optional heading field is given', () => {
      messenger.sendUpdateMessage(TARGET_VEHICLE_ID, 0, 0, VEHICLE_STATUS, { heading: 0 });
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, {
          heading: 0,
          ...UPDATE_MESSAGE,
        }),
      );
    });

    it('should send message when optional battery field is given', () => {
      messenger.sendUpdateMessage(TARGET_VEHICLE_ID, 0, 0, VEHICLE_STATUS, { battery: 0 });
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, {
          battery: 0,
          ...UPDATE_MESSAGE,
        }),
      );
    });

    it('should send message when optional errorMessage field is given', () => {
      messenger.sendUpdateMessage(TARGET_VEHICLE_ID, 0, 0, VEHICLE_STATUS, { errorMessage: '' });
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, {
          errorMessage: '',
          ...UPDATE_MESSAGE,
        }),
      );
    });
  });

  describe('#sendPOIMessage()', () => {
    it('should send message', () => {
      messenger.sendPOIMessage(TARGET_VEHICLE_ID, 0, 0);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, POI_MESSAGE),
      );
    });
  });

  describe('#sendCompleteMessage()', () => {
    it('should send message', () => {
      messenger.sendCompleteMessage(TARGET_VEHICLE_ID);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, COMPLETE_MESSAGE),
      );
    });
  });

  describe('#sendConnectMessage()', () => {
    it('should send message', () => {
      messenger.sendConnectMessage(TARGET_VEHICLE_ID, [JOB_TYPE]);
      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, CONNECT_MESSAGE),
      );
    });
  });

  describe('#sendMessage()', () => {
    it('should throw error if given vehicle ID does not exist', () => {
      assert.throws(
        () => messenger.sendMessage(INVALID_VEHICLE_ID, PAUSE_MESSAGE),
        Error,
        'Provided target vehicle ID does not point to a valid vehicle',
      );
    });

    it('should send ack and bad messages once', () => {
      const ackMessage: Message.AcknowledgementMessage = { type: 'ack', ackid: MESSAGE_ID };
      const badMessage: Message.BadMessage = { type: 'badMessage' };

      messenger.sendMessage(TARGET_VEHICLE_ID, ackMessage);
      sinon.assert.calledOnce(xbeeSendObjectSpy);

      messenger.sendMessage(TARGET_VEHICLE_ID, badMessage);
      sinon.assert.calledTwice(xbeeSendObjectSpy);
      sinon.assert.notCalled(updateHandlerAddHandlerSpy);

      assert.deepEqual(
        getSentMessage(0),
        jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, ackMessage),
      );
      assert.deepEqual(
        getSentMessage(1),
        jsonMessage(MESSAGE_ID + 1, SOURCE_VEHICLE_ID, TARGET_VEHICLE_ID, badMessage),
      );
    });

    it('should have different id per message sent', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      messenger.sendMessage(TARGET_VEHICLE_2_ID, PAUSE_MESSAGE);
      sinon.assert.calledTwice(xbeeSendObjectSpy);

      assert.notEqual(getSentMessage(0).id, getSentMessage(1).id);
    });

    it('should send message to correct vehicle MAC address', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      sinon.assert.calledOnce(xbeeSendObjectSpy);

      const macAddress = xbeeSendObjectSpy.args[0][1];
      assert.equal(macAddress, config.vehicles[TARGET_VEHICLE_ID].macAddress);
    });

    it('should put messages in an outbox if currently sending to vehicle', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      messenger.sendMessage(TARGET_VEHICLE_ID, RESUME_MESSAGE);
      sinon.assert.calledOnce(xbeeSendObjectSpy);

      assert.deepEqual(messenger.sending.get(TARGET_VEHICLE_ID), getSentMessage(0));
      assert.deepEqual(messenger.outbox.get(TARGET_VEHICLE_ID), [RESUME_MESSAGE]);
    });

    it('should keep sending messasges that require acknowledgment and have handlers', (done) => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);

      const message = getSentMessage(0);
      assert.deepEqual(messenger.sending.get(TARGET_VEHICLE_ID), message);
      assert.isDefined(messenger.sendingInterval.get(TARGET_VEHICLE_ID));
      assert.isDefined(messenger.updateHandler.handlers.get(
        Messenger.generateHash(TARGET_VEHICLE_ID, message.id),
      ));

      setTimeout(() => {
        sinon.assert.calledTwice(xbeeSendObjectSpy);
        done();
      }, MESSAGE_SEND_RATE * 2);
    });

    it('should trigger onVehicleDisconnect if a message is not acknowledged in time', (done) => {
      messenger.onVehicleDisconnect = (): void => {
        sinon.assert.calledTwice(xbeeSendObjectSpy);
        done();
      };
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
    });
  });

  describe('#onReceiveObject()', () => {
    describe('with invalid object', () => {
      it('should trigger onReceiveInvalidObject when object received is not a valid message', (done) => {
        messenger.onReceiveInvalidObject = (): void => done();
        messenger.onReceiveObject({});
      });

      it('should trigger onReceiveInvalidObject when object received is a valid message but has an invalid sid', (done) => {
        messenger.onReceiveInvalidObject = (): void => done();
        messenger.onReceiveObject(
          jsonMessage(MESSAGE_ID, INVALID_VEHICLE_ID, TARGET_VEHICLE_ID, PAUSE_MESSAGE),
        );
      });

      it('should trigger onReceiveInvalidObject when object received is a valid message but has a tid field that not same as this vehicle\'s id', (done) => {
        messenger.onReceiveInvalidObject = (): void => done();
        messenger.onReceiveObject(
          jsonMessage(MESSAGE_ID, SOURCE_VEHICLE_ID, INVALID_VEHICLE_ID, PAUSE_MESSAGE),
        );
      });

      it('should call sendBadMessage when object received is not a message but has a valid sid', (done) => {
        const obj = { sid: TARGET_VEHICLE_ID };

        messenger.onReceiveInvalidObject = (): void => {
          sinon.assert.calledOnce(xbeeSendObjectSpy);

          const message = getSentMessage(0);
          assert.isTrue(Message.isBadMessage(message));
          const badMessage = message as Message.BadMessage;
          assert.equal(badMessage.error, `Invalid message received: ${JSON.stringify(obj)}`);
          done();
        };

        messenger.onReceiveObject(obj);
      });

      it('should not call sendBadMessage when object received has an invalid sid', (done) => {
        const obj = { sid: INVALID_VEHICLE_ID };

        messenger.onReceiveInvalidObject = (): void => {
          sinon.assert.notCalled(xbeeSendObjectSpy);
          done();
        };

        messenger.onReceiveObject(obj);
      });

      it('should not call sendBadMessage when invalid sid is in a JSONMessage', (done) => {
        const obj = jsonMessage(MESSAGE_ID, INVALID_VEHICLE_ID, TARGET_VEHICLE_ID, PAUSE_MESSAGE);

        messenger.onReceiveInvalidObject = (): void => {
          sinon.assert.notCalled(xbeeSendObjectSpy);
          done();
        };

        messenger.onReceiveObject(obj);
      });
    });

    describe('with valid message', () => {
      it('should trigger onConnectionAcknowledgementMessage and acknowledge when valid connectionAck message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          CONNECTION_ACKNOWLEDGEMENT_MESSAGE,
        );

        messenger.onConnectionAcknowledgementMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onConnectionAcknowledgementMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onStartMessage and acknowledge when valid start message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          START_MESSAGE,
        );

        messenger.onStartMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onStartMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onAddMissionMessage and acknowledge when valid add mission message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          ADD_MISSION_MESSAGE,
        );

        messenger.onAddMissionMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onAddMissionMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onPauseMessage and acknowledge when valid pause message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          PAUSE_MESSAGE,
        );

        messenger.onPauseMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onPauseMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onResumeMessage and acknowledge when valid resume message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          RESUME_MESSAGE,
        );

        messenger.onResumeMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onResumeMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onStopMessage and acknowledge when valid stop message is received', () => {
        const message = jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, STOP_MESSAGE);

        messenger.onStopMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onStopMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onUpdateMessage and acknowledge when valid update message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          UPDATE_MESSAGE,
        );

        messenger.onUpdateMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onUpdateMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onPOIMessage and acknowledge when valid poi message is received', () => {
        const message = jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, POI_MESSAGE);

        messenger.onPOIMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onPOIMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onCompleteMessage and acknowledge when valid complete message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          COMPLETE_MESSAGE,
        );

        messenger.onCompleteMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onCompleteMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assertAcknowledged(0, message);
      });

      it('should trigger onConnectMessage and acknowledge when valid connect message is received', () => {
        const message = jsonMessage(
          MESSAGE_ID,
          TARGET_VEHICLE_ID,
          SOURCE_VEHICLE_ID,
          CONNECT_MESSAGE,
        );
        const connectionAckMessage = jsonMessage(MESSAGE_ID, message.tid, message.sid, {
          type: 'connectionAck',
        });

        messenger.onConnectMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onConnectMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        assert.deepEqual(connectionAckMessage, getSentMessage(MESSAGE_ID));
      });

      it('should trigger onBadMessage and not acknowledge when valid bad message is received', () => {
        const message = jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, {
          type: 'badMessage',
        });

        messenger.onBadMessage = emptyFunction;
        const spy = sinon.spy(messenger, 'onBadMessage');

        messenger.onReceiveObject(message);
        sinon.assert.calledOnce(spy);
        sinon.assert.notCalled(xbeeSendObjectSpy); // no acknowledgements should have been made
      });

      it('should throw error if a valid message is received but is unsupported', () => {
        const message = {
          id: MESSAGE_ID,
          tid: SOURCE_VEHICLE_ID,
          sid: TARGET_VEHICLE_ID,
          time: TIME,
          type: 'nope',
        };

        // Stop the Message.isJSONMessage check to trigger unsupported message
        const stub = sinon.stub(Message, 'isJSONMessage').returns(true);
        assert.throw(
          () => messenger.onReceiveObject(message),
          Error,
          `Received an unsupported message ${JSON.stringify(message)}`,
        );
        stub.restore();
      });
    });
  });

  describe('#processAcknowledgement', () => {
    it('should stop sending message after it is acknowledged', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      const message = getSentMessage(0);

      assert.deepEqual(message, messenger.sending.get(TARGET_VEHICLE_ID));
      assert.isDefined(messenger.sendingInterval.get(TARGET_VEHICLE_ID));
      assert.isDefined(messenger.updateHandler.handlers.get(
        Messenger.generateHash(TARGET_VEHICLE_ID, message.id),
      ));

      // simulate receiving acknowledgement message
      messenger.onReceiveObject(jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, {
        type: 'ack',
        ackid: message.id,
      }));
      assert.isUndefined(messenger.sending.get(TARGET_VEHICLE_ID));
      assert.isUndefined(messenger.sendingInterval.get(TARGET_VEHICLE_ID));
      assert.isUndefined(messenger.updateHandler.handlers.get(
        Messenger.generateHash(TARGET_VEHICLE_ID, message.id),
      ));
    });

    it('should remove first message from outbox and start sending it on acknowledgement', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      const message = getSentMessage(0);

      messenger.sendMessage(TARGET_VEHICLE_ID, RESUME_MESSAGE);
      assert.deepEqual(messenger.outbox.get(TARGET_VEHICLE_ID), [RESUME_MESSAGE]);

      // simulate receiving acknowledgement message
      messenger.onReceiveObject(jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, {
        type: 'ack',
        ackid: message.id,
      }));

      const nextMessage = getSentMessage(1);
      assert.isUndefined(messenger.outbox.get(TARGET_VEHICLE_ID)); // no more messages to send after
      assert.deepEqual(messenger.sending.get(TARGET_VEHICLE_ID), nextMessage);
      assert.isDefined(messenger.sendingInterval.get(TARGET_VEHICLE_ID));
      assert.isDefined(messenger.updateHandler.handlers.get(
        Messenger.generateHash(TARGET_VEHICLE_ID, nextMessage.id),
      ));
    });

    it('should not delete the outbox for a vehicle if the queue is more than one message', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      const message = getSentMessage(0);

      messenger.sendMessage(TARGET_VEHICLE_ID, RESUME_MESSAGE);
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);
      assert.deepEqual(messenger.outbox.get(TARGET_VEHICLE_ID), [RESUME_MESSAGE, PAUSE_MESSAGE]);

      // simulate receiving acknowledgement message
      messenger.onReceiveObject(jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, {
        type: 'ack',
        ackid: message.id,
      }));

      const nextMessage = getSentMessage(1);
      assert.deepEqual(messenger.outbox.get(TARGET_VEHICLE_ID), [PAUSE_MESSAGE]);
      assert.deepEqual(messenger.sending.get(TARGET_VEHICLE_ID), nextMessage);
      assert.isDefined(messenger.sendingInterval.get(TARGET_VEHICLE_ID));
      assert.isDefined(messenger.updateHandler.handlers.get(
        Messenger.generateHash(TARGET_VEHICLE_ID, nextMessage.id),
      ));
    });

    it('should throw error if outbox exists with no messages in it', () => {
      messenger.sendMessage(TARGET_VEHICLE_ID, PAUSE_MESSAGE);

      messenger.outbox.set(TARGET_VEHICLE_ID, []);

      assert.throws(
        () => messenger.onReceiveObject(
          jsonMessage(MESSAGE_ID, TARGET_VEHICLE_ID, SOURCE_VEHICLE_ID, {
            type: 'ack',
            ackid: getSentMessage(0).id,
          }),
        ),
        Error,
        'Obtained message in outbox that is undefined',
      );
    });
  });
});
