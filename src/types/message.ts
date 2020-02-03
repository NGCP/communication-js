/**
 * Type declaration for all message between GCS and vehicles. See the following URL for the
 * list of messages:
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages.html
 */

import * as Task from './task';

/** Jobs vehicles can have */
type JobType = 'isrSearch' | 'payloadDrop' | 'ugvRescue' | 'uuvRescue'
| 'quickScan' | 'detailedSearch' | 'guide';

/** Type guard for JobType */
function isJobType(type: string): type is JobType {
  return type === 'isrSearch' || type === 'payloadDrop' || type === 'ugvRescue'
    || type === 'uuvRescue' || type === 'quickScan' || type === 'detailedSearch'
    || type === 'guide';
}

type VehicleStatus = 'ready' | 'error' | 'disconnected' | 'waiting' | 'running' | 'paused';

/** All types of messages */
type MessageType = 'start' | 'addMission' | 'pause' | 'resume' | 'stop' | 'connectionAck' | 'update'
| 'poi' | 'complete' | 'connect' | 'ack' | 'badMessage';

/** Type guard for MessageType */
function isMessageType(type: string): type is MessageType {
  return type === 'string' || type === 'addMission' || type === 'pause' || type === 'resume'
    || type === 'stop' || type === 'connectionAck' || type === 'update' || type === 'poi'
    || type === 'complete' || type === 'connect' || type === 'ack' || type === 'badMessage';
}

interface MessageTypeBase {
  type: MessageType;
}

// Definitions for all messages from GCS to vehicles.
// Does not need type guards since all of these messages are from GCS.

export interface StartMessage extends MessageTypeBase {
  type: 'start';
  jobType: JobType;
}

export interface AddMissionMessage extends MessageTypeBase {
  type: 'addMission';
  missionInfo: Task.Task;
}

export interface PauseMessage extends MessageTypeBase {
  type: 'pause';
}

export interface ResumeMessage extends MessageTypeBase {
  type: 'resume';
}

export interface StopMessage extends MessageTypeBase {
  type: 'stop';
}

export interface ConnectionAckMessage extends MessageTypeBase {
  type: 'connectionAck';
}

// Definitions for all messages from vehicles to GCS.
// Needs type guards since all of these messages are not from GCS and possibly could be invalid.

export interface UpdateMessage extends MessageTypeBase {
  type: 'update';
  lat: number;
  lng: number;
  alt?: number;
  heading?: number;
  battery?: number;
  status: VehicleStatus;
  errorMessage?: string;
}

/** Type guard for UpdateMessage */
export function isUpdateMessage(message: Message): message is UpdateMessage {
  const mandatoryCheck = message.type === 'update'
    && Number.isFinite(message.lat)
    && Number.isFinite(message.lng);

  if (!mandatoryCheck) return false;

  const updateMessage = message as UpdateMessage;
  if (updateMessage.alt && !Number.isFinite(updateMessage.alt)) return false;
  if (updateMessage.heading && !Number.isFinite(updateMessage.heading)) return false;
  if (updateMessage.battery && !Number.isFinite(updateMessage.battery)) return false;

  return true;
}

export interface POIMessage extends MessageTypeBase {
  type: 'poi';
  lat: number;
  lng: number;
}

/** Type guard for POIMessage */
export function isPOIMessage(message: Message): message is POIMessage {
  return message.type === 'poi' && Number.isFinite(message.lat) && Number.isFinite(message.lng);
}

export interface CompleteMessage extends MessageTypeBase {
  type: 'complete';
}

/** Type guard for CompleteMessage */
export function isCompleteMessage(message: Message): message is CompleteMessage {
  return message.type === 'complete';
}

export interface ConnectMessage extends MessageTypeBase {
  type: 'connect';
  jobsAvailable: JobType[];
}

/** Type guard for ConnectMessage */
export function isConnectMessage(message: Message): message is ConnectMessage {
  return message.type === 'connect' && message.jobsAvailable.every(isJobType);
}

// Definitions for all other message types. Sent between GCS and vehicles.
// Needs type guards since not all of these messages are from GCS and possibly could be invalid.

export interface AcknowledgementMessage extends MessageTypeBase {
  type: 'ack';
  ackid: number;
}

/** Type guard for AcknowledgementMessage */
export function isAcknowledgementMessage(message: Message): message is AcknowledgementMessage {
  return message.type === 'ack' && Number.isInteger(message.ackid);
}

export interface BadMessage extends MessageTypeBase {
  type: 'badMessage';
  error?: string;
}

/** Type guard for BadMessage */
export function isBadMessage(message: Message): message is BadMessage {
  return message.type === 'badMessage';
}

export type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage
| ConnectionAckMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessage;

/** Same as a Message, but has the required id, tid, sid, time fields. */
export type JSONMessage = Message & {
  id: number;
  tid: number;
  sid: number;
  time: number;
};

/** Type guard for a JSON Message */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJSONMessage(object: { [key: string]: any }): object is JSONMessage {
  if (!object.type || !isMessageType(object.type)) return false;

  const message = object as JSONMessage;
  return Number.isInteger(message.id) && Number.isInteger(message.tid)
    && Number.isInteger(message.sid) && Number.isInteger(message.time);
}
