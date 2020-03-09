import { assert } from 'chai';
import { describe, it } from 'mocha';

import * as Misc from '../../src/types/misc';

describe('VehicleStatus', () => {
  it('should properly validate type', () => {
    assert.isTrue(Misc.isVehicleStatus('ready'));
    assert.isTrue(Misc.isVehicleStatus('error'));
    assert.isTrue(Misc.isVehicleStatus('disconnected'));
    assert.isTrue(Misc.isVehicleStatus('waiting'));
    assert.isTrue(Misc.isVehicleStatus('running'));
    assert.isTrue(Misc.isVehicleStatus('paused'));
    assert.isFalse(Misc.isVehicleStatus('nope'));
  });
});

describe('JobType', () => {
  it('should properly validate type', () => {
    assert.isTrue(Misc.isJobType('isrSearch'));
    assert.isTrue(Misc.isJobType('payloadDrop'));
    assert.isTrue(Misc.isJobType('ugvRescue'));
    assert.isTrue(Misc.isJobType('uuvRescue'));
    assert.isTrue(Misc.isJobType('quickScan'));
    assert.isTrue(Misc.isJobType('detailedSearch'));
    assert.isTrue(Misc.isJobType('guide'));
    assert.isFalse(Misc.isJobType('nope'));
  });
});

describe('TaskType', () => {
  it('should properly validate type', () => {
    assert.isTrue(Misc.isTaskType('takeoff'));
    assert.isTrue(Misc.isTaskType('loiter'));
    assert.isTrue(Misc.isTaskType('isrSearch'));
    assert.isTrue(Misc.isTaskType('payloadDrop'));
    assert.isTrue(Misc.isTaskType('land'));
    assert.isTrue(Misc.isTaskType('retrieveTarget'));
    assert.isTrue(Misc.isTaskType('deliverTarget'));
    assert.isTrue(Misc.isTaskType('quickScan'));
    assert.isTrue(Misc.isTaskType('detailedSearch'));
    assert.isFalse(Misc.isTaskType('nope'));
  });
});

describe('MessageType', () => {
  it('should properly validate type', () => {
    assert.isTrue(Misc.isMessageType('start'));
    assert.isTrue(Misc.isMessageType('addMission'));
    assert.isTrue(Misc.isMessageType('pause'));
    assert.isTrue(Misc.isMessageType('resume'));
    assert.isTrue(Misc.isMessageType('stop'));
    assert.isTrue(Misc.isMessageType('connectionAck'));
    assert.isTrue(Misc.isMessageType('update'));
    assert.isTrue(Misc.isMessageType('poi'));
    assert.isTrue(Misc.isMessageType('complete'));
    assert.isTrue(Misc.isMessageType('ack'));
    assert.isTrue(Misc.isMessageType('badMessage'));
    assert.isFalse(Misc.isMessageType('nope'));
  });
});
