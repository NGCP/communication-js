import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as Message from '../../src/types/message';
import * as Misc from '../../src/types/misc';
import * as Task from '../../src/types/task';

const JOB_TYPE: Misc.JobType = 'isrSearch';
const JOB_TYPE2: Misc.JobType = 'payloadDrop';
const STATUS: Misc.VehicleStatus = 'ready';
const TASK_TYPE: Misc.TaskType = 'loiter';
const MISSION_INFO: Task.LoiterTask = {
  taskType: TASK_TYPE,
  lat: 0,
  lng: 0,
  alt: 0,
  radius: 0,
  direction: 0,
};

describe('StartMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isStartMessage({}));
    assert.isFalse(Message.isStartMessage({ type: 'start' }));
    assert.isFalse(Message.isStartMessage({ jobType: JOB_TYPE }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isStartMessage({ type: 'nope', jobType: JOB_TYPE }));
  });

  it('should fail without proper job type', () => {
    assert.isFalse(Message.isStartMessage({ type: 'start', jobType: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isStartMessage({ type: 'start', jobType: JOB_TYPE }));
  });
});

describe('AddMissionMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isAddMissionMessage({}));
    assert.isFalse(Message.isAddMissionMessage({ type: 'addMission' }));
    assert.isFalse(Message.isAddMissionMessage({ missionInfo: MISSION_INFO }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isAddMissionMessage({ type: 'nope', missionInfo: MISSION_INFO }));
  });

  it('should fail without proper mission info', () => {
    assert.isFalse(Message.isAddMissionMessage({ type: 'addMission', missionInfo: {} }));
    assert.isFalse(
      Message.isAddMissionMessage({ type: 'addMission', missionInfo: { taskType: 'nope' } }),
    );
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isAddMissionMessage({ type: 'addMission', missionInfo: MISSION_INFO }));
  });
});

describe('PauseMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isPauseMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isPauseMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isPauseMessage({ type: 'pause' }));
  });
});

describe('ResumeMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isResumeMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isResumeMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isResumeMessage({ type: 'resume' }));
  });
});

describe('StopMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isStopMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isStopMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isStopMessage({ type: 'stop' }));
  });
});

describe('ConnectionAcknowledgementMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isConnectionAcknowledgementMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isConnectionAcknowledgementMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isConnectionAcknowledgementMessage({ type: 'connectionAck' }));
  });
});

describe('UpdateMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isUpdateMessage({}));
    assert.isFalse(Message.isUpdateMessage({ type: 'update' }));
    assert.isFalse(Message.isUpdateMessage({ lat: 0 }));
    assert.isFalse(Message.isUpdateMessage({ lng: 0 }));
    assert.isFalse(Message.isUpdateMessage({ status: STATUS }));

    assert.isFalse(Message.isUpdateMessage({ type: 'update', lat: 0 }));
    assert.isFalse(Message.isUpdateMessage({ type: 'update', lng: 0 }));
    assert.isFalse(Message.isUpdateMessage({ type: 'update', status: STATUS }));
    assert.isFalse(Message.isUpdateMessage({ lat: 0, lng: 0 }));
    assert.isFalse(Message.isUpdateMessage({ lat: 0, status: STATUS }));
    assert.isFalse(Message.isUpdateMessage({ lng: 0, status: STATUS }));

    assert.isFalse(Message.isUpdateMessage({ type: 'update', lat: 0, lng: 0 }));
    assert.isFalse(Message.isUpdateMessage({ type: 'update', lat: 0, status: STATUS }));
    assert.isFalse(Message.isUpdateMessage({ type: 'update', lng: 0, status: STATUS }));
    assert.isFalse(Message.isUpdateMessage({ lat: 0, lng: 0, status: STATUS }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'nope',
      lat: 0,
      lng: 0,
      status: STATUS,
    }));
  });

  it('should fail without proper latitude', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 'nope',
      lng: 0,
      status: STATUS,
    }));
  });

  it('should fail without proper longitude', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 'nope',
      status: STATUS,
    }));
  });

  it('should fail without proper vehicle status', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: 'nope',
    }));
  });

  it('should fail with improper altitude', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      alt: 'nope',
    }));
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      heading: 'nope',
    }));
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      battery: 'nope',
    }));
  });

  it('should fail with improper heading', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      heading: 'nope',
    }));
  });

  it('should fail with improper battery', () => {
    assert.isFalse(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      battery: 'nope',
    }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      alt: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      heading: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      battery: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      errorMessage: 'some error message',
    }));
  });
});

describe('POIMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isPOIMessage({}));
    assert.isFalse(Message.isPOIMessage({ type: 'poi' }));
    assert.isFalse(Message.isPOIMessage({ lat: 0 }));
    assert.isFalse(Message.isPOIMessage({ lng: 0 }));

    assert.isFalse(Message.isPOIMessage({ type: 'poi', lat: 0 }));
    assert.isFalse(Message.isPOIMessage({ type: 'poi', lng: 0 }));
    assert.isFalse(Message.isPOIMessage({ lat: 0, lng: 0 }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isPOIMessage({ type: 'nope', lat: 0, lng: 0 }));
  });

  it('should fail without proper latitude', () => {
    assert.isFalse(Message.isPOIMessage({
      type: 'poi',
      lat: 'nope',
      lng: 0,
    }));
  });

  it('should fail without proper longitude', () => {
    assert.isFalse(Message.isPOIMessage({
      type: 'poi',
      lat: 0,
      lng: 'nope',
    }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isPOIMessage({ type: 'poi', lat: 0, lng: 0 }));
  });
});

describe('CompleteMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isCompleteMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isCompleteMessage({}));
    assert.isFalse(Message.isCompleteMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isCompleteMessage({ type: 'complete' }));
  });
});

describe('ConnectMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isConnectMessage({}));
    assert.isFalse(Message.isConnectMessage({ type: 'connect' }));
    assert.isFalse(Message.isConnectMessage({ jobsAvailable: [JOB_TYPE] }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isConnectMessage({ type: 'nope', jobsAvailable: [JOB_TYPE] }));
  });

  it('should fail without proper jobsAvailable', () => {
    assert.isFalse(Message.isConnectMessage({ type: 'connect', jobsAvailable: 'nope' }));
    assert.isFalse(Message.isConnectMessage({ type: 'connect', jobsAvailable: ['nope'] }));
    assert.isFalse(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE, 'nope'] }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE] }));
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE, JOB_TYPE] }));
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE, JOB_TYPE2] }));
  });
});

describe('AcknowledgementMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isAcknowledgementMessage({}));
    assert.isFalse(Message.isAcknowledgementMessage({ type: 'ack' }));
    assert.isFalse(Message.isAcknowledgementMessage({ ackid: 0 }));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isAcknowledgementMessage({ type: 'nope', ackid: 0 }));
  });

  it('should fail without proper ackid', () => {
    assert.isFalse(Message.isAcknowledgementMessage({ type: 'ack', ackid: 'nope' }));
    assert.isFalse(Message.isAcknowledgementMessage({ type: 'ack', ackid: 3.14 }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isAcknowledgementMessage({ type: 'ack', ackid: 0 }));
  });
});

describe('BadMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isBadMessage({}));
  });

  it('should fail without proper message type', () => {
    assert.isFalse(Message.isBadMessage({ type: 'nope' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isBadMessage({ type: 'badMessage' }));
    assert.isTrue(Message.isBadMessage({
      type: 'badMessage',
      error: 'some error message',
    }));
  });
});

describe('Message', () => {
  it('should fail without proper message type', () => {
    assert.isFalse(Message.isMessage({ type: 'nope' }));
  });

  it('should fail without proper required message fields', () => {
    assert.isFalse(Message.isMessage({ type: 'start' }));
    assert.isFalse(Message.isMessage({ type: 'addMission' }));
    assert.isFalse(Message.isMessage({ type: 'update' }));
    assert.isFalse(Message.isMessage({ type: 'poi' }));
    assert.isFalse(Message.isMessage({ type: 'connect' }));
    assert.isFalse(Message.isMessage({ type: 'ack' }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isMessage({ type: 'start', jobType: JOB_TYPE }));
    assert.isTrue(Message.isAddMissionMessage({ type: 'addMission', missionInfo: MISSION_INFO }));
    assert.isTrue(Message.isPauseMessage({ type: 'pause' }));
    assert.isTrue(Message.isResumeMessage({ type: 'resume' }));
    assert.isTrue(Message.isStopMessage({ type: 'stop' }));
    assert.isTrue(Message.isConnectionAcknowledgementMessage({ type: 'connectionAck' }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      alt: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      heading: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      battery: 0,
    }));
    assert.isTrue(Message.isUpdateMessage({
      type: 'update',
      lat: 0,
      lng: 0,
      status: STATUS,
      errorMessage: 'some error message',
    }));
    assert.isTrue(Message.isPOIMessage({ type: 'poi', lat: 0, lng: 0 }));
    assert.isTrue(Message.isCompleteMessage({ type: 'complete' }));
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE] }));
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE, JOB_TYPE] }));
    assert.isTrue(Message.isConnectMessage({ type: 'connect', jobsAvailable: [JOB_TYPE, JOB_TYPE2] }));
    assert.isTrue(Message.isAcknowledgementMessage({ type: 'ack', ackid: 0 }));
    assert.isTrue(Message.isBadMessage({ type: 'badMessage' }));
    assert.isTrue(Message.isBadMessage({
      type: 'badMessage',
      error: 'some error message',
    }));
  });
});

describe('JSONMessage', () => {
  it('should fail with missing fields', () => {
    assert.isFalse(Message.isJSONMessage({}));
    assert.isFalse(Message.isJSONMessage({ id: 0 }));
    assert.isFalse(Message.isJSONMessage({ sid: 0 }));
    assert.isFalse(Message.isJSONMessage({ tid: 0 }));
    assert.isFalse(Message.isJSONMessage({ time: 0 }));
    assert.isFalse(Message.isJSONMessage({ type: 'pause' }));

    assert.isFalse(Message.isJSONMessage({ id: 0, sid: 0 }));
    assert.isFalse(Message.isJSONMessage({ id: 0, tid: 0 }));
    assert.isFalse(Message.isJSONMessage({ id: 0, time: 0 }));
    assert.isFalse(Message.isJSONMessage({ id: 0, type: 'pause' }));
    assert.isFalse(Message.isJSONMessage({ sid: 0, tid: 0 }));
    assert.isFalse(Message.isJSONMessage({ sid: 0, time: 0 }));
    assert.isFalse(Message.isJSONMessage({ sid: 0, type: 'pause' }));
    assert.isFalse(Message.isJSONMessage({ tid: 0, time: 0 }));
    assert.isFalse(Message.isJSONMessage({ tid: 0, type: 'pause' }));
    assert.isFalse(Message.isJSONMessage({ time: 0, type: 'pause' }));

    assert.isFalse(Message.isJSONMessage({ id: 0, sid: 0, tid: 0 }));
    assert.isFalse(Message.isJSONMessage({ id: 0, sid: 0, time: 0 }));
    assert.isFalse(Message.isJSONMessage({ id: 0, sid: 0, type: 'pause' }));
    assert.isFalse(Message.isJSONMessage({ sid: 0, tid: 0, time: 0 }));
    assert.isFalse(Message.isJSONMessage({ sid: 0, tid: 0, type: 'pause' }));
    assert.isFalse(Message.isJSONMessage({ tid: 0, time: 0, type: 'pause' }));

    assert.isFalse(Message.isJSONMessage({
      id: 0,
      sid: 0,
      tid: 0,
      time: 0,
    }));
    assert.isFalse(Message.isJSONMessage({
      id: 0,
      sid: 0,
      tid: 0,
      type: 'pause',
    }));
    assert.isFalse(Message.isJSONMessage({
      sid: 0,
      tid: 0,
      time: 0,
      type: 'pause',
    }));
  });

  it('should pass with valid fields', () => {
    assert.isTrue(Message.isJSONMessage({
      id: 0,
      sid: 0,
      tid: 0,
      time: 0,
      type: 'pause',
    }));
  });
});
