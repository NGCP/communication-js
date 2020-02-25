"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Type guard for VehicleStatus */
function isVehicleStatus(status) {
    return status === 'ready' || status === 'error' || status === 'disconnected'
        || status === 'waiting' || status === 'running' || status === 'paused';
}
exports.isVehicleStatus = isVehicleStatus;
/** Type guard for JobType */
function isJobType(type) {
    return type === 'isrSearch' || type === 'payloadDrop' || type === 'ugvRescue'
        || type === 'uuvRescue' || type === 'quickScan' || type === 'detailedSearch'
        || type === 'guide';
}
exports.isJobType = isJobType;
/** Type guard for TaskType */
function isTaskType(type) {
    return type === 'takeoff' || type === 'loiter' || type === 'isrSearch'
        || type === 'payloadDrop' || type === 'land' || type === 'retrieveTarget'
        || type === 'deliverTarget' || type === 'quickScan' || type === 'detailedSearch';
}
exports.isTaskType = isTaskType;
/** Type guard for MessageType */
function isMessageType(type) {
    return type === 'string' || type === 'addMission' || type === 'pause' || type === 'resume'
        || type === 'stop' || type === 'connectionAck' || type === 'update' || type === 'poi'
        || type === 'complete' || type === 'connect' || type === 'ack' || type === 'badMessage';
}
exports.isMessageType = isMessageType;
