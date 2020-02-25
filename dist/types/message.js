"use strict";
/**
 * Type declaration for all message between GCS and vehicles. See the following URL for the
 * list of messages:
 * https://ground-control-station.readthedocs.io/en/latest/communications/messages.html
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Misc = __importStar(require("./misc"));
/** Type guard for StartMessage */
function isStartMessage(message) {
    return message.type === 'start'
        && Misc.isJobType(message.jobType);
}
exports.isStartMessage = isStartMessage;
/** Type guard for AddMissionMessage */
function isAddMissionMessage(message) {
    return message.type === 'addMission'
        && message.missionInfo && Misc.isTaskType(message.missionInfo.taskType);
}
exports.isAddMissionMessage = isAddMissionMessage;
/** Type guard for PauseMessage */
function isPauseMessage(message) {
    return message.type === 'pause';
}
exports.isPauseMessage = isPauseMessage;
/** Type guard for ResumeMessage */
function isResumeMessage(message) {
    return message.type === 'resume';
}
exports.isResumeMessage = isResumeMessage;
/** Type guard for StopMessage */
function isStopMessage(message) {
    return message.type === 'stop';
}
exports.isStopMessage = isStopMessage;
/** Type guard for ConnectionAckMessage */
function isConnectionAcknowledgementMessage(message) {
    return message.type === 'connectionAck';
}
exports.isConnectionAcknowledgementMessage = isConnectionAcknowledgementMessage;
/** Type guard for UpdateMessage */
function isUpdateMessage(message) {
    var mandatoryCheck = message.type === 'update'
        && Number.isFinite(message.lat)
        && Number.isFinite(message.lng);
    if (!mandatoryCheck)
        return false;
    var updateMessage = message;
    if (updateMessage.alt && !Number.isFinite(updateMessage.alt))
        return false;
    if (updateMessage.heading && !Number.isFinite(updateMessage.heading))
        return false;
    if (updateMessage.battery && !Number.isFinite(updateMessage.battery))
        return false;
    return true;
}
exports.isUpdateMessage = isUpdateMessage;
/** Type guard for POIMessage */
function isPOIMessage(message) {
    return message.type === 'poi' && Number.isFinite(message.lat) && Number.isFinite(message.lng);
}
exports.isPOIMessage = isPOIMessage;
/** Type guard for CompleteMessage */
function isCompleteMessage(message) {
    return message.type === 'complete';
}
exports.isCompleteMessage = isCompleteMessage;
/** Type guard for ConnectMessage */
function isConnectMessage(message) {
    return message.type === 'connect' && message.jobsAvailable.every(Misc.isJobType);
}
exports.isConnectMessage = isConnectMessage;
/** Type guard for AcknowledgementMessage */
function isAcknowledgementMessage(message) {
    return message.type === 'ack' && Number.isInteger(message.ackid);
}
exports.isAcknowledgementMessage = isAcknowledgementMessage;
/** Type guard for BadMessage */
function isBadMessage(message) {
    return message.type === 'badMessage';
}
exports.isBadMessage = isBadMessage;
/** Type guard for a JSON Message, only checks for required id, tid, sid, time, and type fields */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isJSONMessage(object) {
    if (!object.type || !Misc.isMessageType(object.type))
        return false;
    var message = object;
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
exports.isJSONMessage = isJSONMessage;
