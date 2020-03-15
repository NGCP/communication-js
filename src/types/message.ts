/**
 * Type declaration for all message between GCS and vehicles. See the following URL for the
 * list of messages:
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages/base-message/
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Misc from './misc';
import * as Task from './task';

interface MessageTypeBase {
  type: Misc.MessageType;
}

// Definitions for all messages from GCS to vehicles.
// https://ground-control-station.readthedocs.io/en/latest/communications/messages/gcs-vehicles-messages/

export interface ConnectionAcknowledgementMessage extends MessageTypeBase {
  type: 'connectionAck';
}

/** Type guard for ConnectionAckMessage */
export function isConnectionAcknowledgementMessage(
  obj: { [key: string]: any },
): obj is ConnectionAcknowledgementMessage {
  return obj.type === 'connectionAck';
}

export interface StartMessage extends MessageTypeBase {
  type: 'start';
  jobType: Misc.JobType;
}

/** Type guard for StartMessage */
export function isStartMessage(obj: { [key: string]: any }): obj is StartMessage {
  return obj.type === 'start' && Misc.isJobType(obj.jobType);
}

export interface AddMissionMessage extends MessageTypeBase {
  type: 'addMission';
  missionInfo: Task.Task;
}

/** Type guard for AddMissionMessage */
export function isAddMissionMessage(obj: { [key: string]: any }): obj is AddMissionMessage {
  return obj.type === 'addMission'
    && obj.missionInfo !== undefined && Misc.isTaskType(obj.missionInfo.taskType);
}

export interface PauseMessage extends MessageTypeBase {
  type: 'pause';
}

/** Type guard for PauseMessage */
export function isPauseMessage(obj: { [key: string]: any }): obj is PauseMessage {
  return obj.type === 'pause';
}

export interface ResumeMessage extends MessageTypeBase {
  type: 'resume';
}

/** Type guard for ResumeMessage */
export function isResumeMessage(obj: { [key: string]: any }): obj is ResumeMessage {
  return obj.type === 'resume';
}

export interface StopMessage extends MessageTypeBase {
  type: 'stop';
}

/** Type guard for StopMessage */
export function isStopMessage(obj: { [key: string]: any }): obj is StopMessage {
  return obj.type === 'stop';
}

// Definitions for all messages from vehicles to GCS.
// https://ground-control-station.readthedocs.io/en/latest/communications/messages/vehicles-gcs-messages/

export interface UpdateMessage extends MessageTypeBase {
  type: 'update';
  lat: number;
  lng: number;
  alt?: number;
  heading?: number;
  battery?: number;
  status: Misc.VehicleStatus;
  errorMessage?: string;
}

/** Type guard for UpdateMessage */
export function isUpdateMessage(obj: { [key: string]: any }): obj is UpdateMessage {
  if (obj.type !== 'update'
    || !Number.isFinite(obj.lat)
    || !Number.isFinite(obj.lng)
    || !Misc.isVehicleStatus(obj.status)) {
    return false;
  }

  // optional fields
  if (obj.alt !== undefined && !Number.isFinite(obj.alt)) {
    return false;
  }
  if (obj.heading !== undefined && !Number.isFinite(obj.heading)) {
    return false;
  }
  if (obj.battery !== undefined && !Number.isFinite(obj.battery)) {
    return false;
  }

  return true;
}

export interface POIMessage extends MessageTypeBase {
  type: 'poi';
  lat: number;
  lng: number;
}

/** Type guard for POIMessage */
export function isPOIMessage(obj: { [key: string]: any }): obj is POIMessage {
  return obj.type === 'poi' && Number.isFinite(obj.lat) && Number.isFinite(obj.lng);
}

export interface CompleteMessage extends MessageTypeBase {
  type: 'complete';
}

/** Type guard for CompleteMessage */
export function isCompleteMessage(obj: { [key: string]: any }): obj is CompleteMessage {
  return obj.type === 'complete';
}

export interface ConnectMessage extends MessageTypeBase {
  type: 'connect';
  jobsAvailable: Misc.JobType[];
}

/** Type guard for ConnectMessage */
export function isConnectMessage(obj: { [key: string]: any }): obj is ConnectMessage {
  return obj.type === 'connect'
    && Array.isArray(obj.jobsAvailable) && obj.jobsAvailable.every(Misc.isJobType);
}

// Definitions for all other message types. Sent between GCS and vehicles.
// https://ground-control-station.readthedocs.io/en/latest/communications/messages/other-messages/

export interface AcknowledgementMessage extends MessageTypeBase {
  type: 'ack';
  ackid: number;
}

/** Type guard for AcknowledgementMessage */
export function isAcknowledgementMessage(
  obj: { [key: string]: any },
): obj is AcknowledgementMessage {
  return obj.type === 'ack' && Number.isInteger(obj.ackid);
}

export interface BadMessage extends MessageTypeBase {
  type: 'badMessage';
  error?: string;
}

/** Type guard for BadMessage */
export function isBadMessage(obj: { [key: string]: any }): obj is BadMessage {
  return obj.type === 'badMessage';
}

export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAcknowledgementMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessage;

/** Type guard for a Message */
export function isMessage(obj: { [key: string]: any }): obj is Message {
  if (!Misc.isMessageType(obj.type)) {
    return false;
  }

  return isStartMessage(obj)
    || isAddMissionMessage(obj)
    || isPauseMessage(obj)
    || isResumeMessage(obj)
    || isStopMessage(obj)
    || isConnectionAcknowledgementMessage(obj)
    || isUpdateMessage(obj)
    || isPOIMessage(obj)
    || isCompleteMessage(obj)
    || isConnectMessage(obj)
    || isAcknowledgementMessage(obj)
    || isBadMessage(obj);
}

/** Same as a Message, but has the required id, tid, sid, time fields. */
export type JSONMessage = Message & {
  id: number;
  tid: number;
  sid: number;
  time: number;
};

/** Type guard for a JSON Message */
export function isJSONMessage(obj: { [key: string]: any }): obj is JSONMessage {
  return Number.isInteger(obj.id)
    && Number.isInteger(obj.tid)
    && Number.isInteger(obj.sid)
    && Number.isInteger(obj.time)
    && isMessage(obj);
}
