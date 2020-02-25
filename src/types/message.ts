/**
 * Type declaration for all message between GCS and vehicles. See the following URL for the
 * list of messages:
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages.html
 */

import * as Misc from './misc';
import * as Task from './task';

interface MessageTypeBase {
  type: Misc.MessageType;
}

// Definitions for all messages from GCS to vehicles.

export interface StartMessage extends MessageTypeBase {
  type: 'start';
  jobType: Misc.JobType;
}

/** Type guard for StartMessage */
export function isStartMessage(message: Message): message is StartMessage {
  return message.type === 'start'
    && Misc.isJobType(message.jobType);
}

export interface AddMissionMessage extends MessageTypeBase {
  type: 'addMission';
  missionInfo: Task.Task;
}

/** Type guard for AddMissionMessage */
export function isAddMissionMessage(message: Message): message is AddMissionMessage {
  return message.type === 'addMission'
    && message.missionInfo && Misc.isTaskType(message.missionInfo.taskType);
}

export interface PauseMessage extends MessageTypeBase {
  type: 'pause';
}

/** Type guard for PauseMessage */
export function isPauseMessage(message: Message): message is PauseMessage {
  return message.type === 'pause';
}

export interface ResumeMessage extends MessageTypeBase {
  type: 'resume';
}

/** Type guard for ResumeMessage */
export function isResumeMessage(message: Message): message is ResumeMessage {
  return message.type === 'resume';
}

export interface StopMessage extends MessageTypeBase {
  type: 'stop';
}

/** Type guard for StopMessage */
export function isStopMessage(message: Message): message is StopMessage {
  return message.type === 'stop';
}

export interface ConnectionAcknowledgementMessage extends MessageTypeBase {
  type: 'connectionAck';
}

/** Type guard for ConnectionAckMessage */
export function isConnectionAcknowledgementMessage(
  message: Message,
): message is ConnectionAcknowledgementMessage {
  return message.type === 'connectionAck';
}

// Definitions for all messages from vehicles to GCS.

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
  jobsAvailable: Misc.JobType[];
}

/** Type guard for ConnectMessage */
export function isConnectMessage(message: Message): message is ConnectMessage {
  return message.type === 'connect' && message.jobsAvailable.every(Misc.isJobType);
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
| ConnectionAcknowledgementMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage
| AcknowledgementMessage | BadMessage;

/** Same as a Message, but has the required id, tid, sid, time fields. */
export type JSONMessage = Message & {
  id: number;
  tid: number;
  sid: number;
  time: number;
};

/** Type guard for a JSON Message, only checks for required id, tid, sid, time, and type fields */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJSONMessage(object: { [key: string]: any }): object is JSONMessage {
  if (!object.type || !Misc.isMessageType(object.type)) return false;

  const message = object as JSONMessage;
  if (!Number.isInteger(message.id) || !Number.isInteger(message.tid)
    || !Number.isInteger(message.sid) || !Number.isInteger(message.time)) {
    return false;
  }

  return isStartMessage(message)
    || isAddMissionMessage(message)
    || isPauseMessage(message)
    || isResumeMessage(message)
    || isStopMessage(message)
    || isConnectionAcknowledgementMessage(message)
    || isUpdateMessage(message)
    || isPOIMessage(message)
    || isCompleteMessage(message)
    || isConnectMessage(message)
    || isAcknowledgementMessage(message)
    || isBadMessage(message);
}
