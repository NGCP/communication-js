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
export interface StartMessage extends MessageTypeBase {
    type: 'start';
    jobType: Misc.JobType;
}
/** Type guard for StartMessage */
export declare function isStartMessage(message: Message): message is StartMessage;
export interface AddMissionMessage extends MessageTypeBase {
    type: 'addMission';
    missionInfo: Task.Task;
}
/** Type guard for AddMissionMessage */
export declare function isAddMissionMessage(message: Message): message is AddMissionMessage;
export interface PauseMessage extends MessageTypeBase {
    type: 'pause';
}
/** Type guard for PauseMessage */
export declare function isPauseMessage(message: Message): message is PauseMessage;
export interface ResumeMessage extends MessageTypeBase {
    type: 'resume';
}
/** Type guard for ResumeMessage */
export declare function isResumeMessage(message: Message): message is ResumeMessage;
export interface StopMessage extends MessageTypeBase {
    type: 'stop';
}
/** Type guard for StopMessage */
export declare function isStopMessage(message: Message): message is StopMessage;
export interface ConnectionAcknowledgementMessage extends MessageTypeBase {
    type: 'connectionAck';
}
/** Type guard for ConnectionAckMessage */
export declare function isConnectionAcknowledgementMessage(message: Message): message is ConnectionAcknowledgementMessage;
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
export declare function isUpdateMessage(message: Message): message is UpdateMessage;
export interface POIMessage extends MessageTypeBase {
    type: 'poi';
    lat: number;
    lng: number;
}
/** Type guard for POIMessage */
export declare function isPOIMessage(message: Message): message is POIMessage;
export interface CompleteMessage extends MessageTypeBase {
    type: 'complete';
}
/** Type guard for CompleteMessage */
export declare function isCompleteMessage(message: Message): message is CompleteMessage;
export interface ConnectMessage extends MessageTypeBase {
    type: 'connect';
    jobsAvailable: Misc.JobType[];
}
/** Type guard for ConnectMessage */
export declare function isConnectMessage(message: Message): message is ConnectMessage;
export interface AcknowledgementMessage extends MessageTypeBase {
    type: 'ack';
    ackid: number;
}
/** Type guard for AcknowledgementMessage */
export declare function isAcknowledgementMessage(message: Message): message is AcknowledgementMessage;
export interface BadMessage extends MessageTypeBase {
    type: 'badMessage';
    error?: string;
}
/** Type guard for BadMessage */
export declare function isBadMessage(message: Message): message is BadMessage;
export declare type Message = StartMessage | AddMissionMessage | PauseMessage | ResumeMessage | StopMessage | ConnectionAcknowledgementMessage | UpdateMessage | POIMessage | CompleteMessage | ConnectMessage | AcknowledgementMessage | BadMessage;
/** Same as a Message, but has the required id, tid, sid, time fields. */
export declare type JSONMessage = Message & {
    id: number;
    tid: number;
    sid: number;
    time: number;
};
/** Type guard for a JSON Message, only checks for required id, tid, sid, time, and type fields */
export declare function isJSONMessage(object: {
    [key: string]: any;
}): object is JSONMessage;
export {};
