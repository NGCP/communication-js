/** All different vehicle statuses */
export type VehicleStatus = 'ready' | 'error' | 'disconnected' | 'waiting' | 'running' | 'paused';

/** Type guard for VehicleStatus */
export function isVehicleStatus(status: string): status is VehicleStatus {
  return status === 'ready' || status === 'error' || status === 'disconnected'
   || status === 'waiting' || status === 'running' || status === 'paused';
}

/** Jobs vehicles can have */
export type JobType = 'isrSearch' | 'payloadDrop' | 'ugvRescue' | 'uuvRescue'
| 'quickScan' | 'detailedSearch' | 'guide';

/** Type guard for JobType */
export function isJobType(type: string): type is JobType {
  return type === 'isrSearch' || type === 'payloadDrop' || type === 'ugvRescue'
    || type === 'uuvRescue' || type === 'quickScan' || type === 'detailedSearch'
    || type === 'guide';
}

/** All types of tasks */
export type TaskType = 'takeoff' | 'loiter' | 'isrSearch' | 'payloadDrop' | 'land'
| 'retrieveTarget' | 'deliverTarget' | 'quickScan' | 'detailedSearch';

/** Type guard for TaskType */
export function isTaskType(type: string): type is TaskType {
  return type === 'takeoff' || type === 'loiter' || type === 'isrSearch'
    || type === 'payloadDrop' || type === 'land' || type === 'retrieveTarget'
    || type === 'deliverTarget' || type === 'quickScan' || type === 'detailedSearch';
}

/** All types of messages */
export type MessageType = 'start' | 'addMission' | 'pause' | 'resume' | 'stop' | 'connectionAck'
| 'update' | 'poi' | 'complete' | 'connect' | 'ack' | 'badMessage';

/** Type guard for MessageType */
export function isMessageType(type: string): type is MessageType {
  return type === 'start' || type === 'addMission' || type === 'pause' || type === 'resume'
    || type === 'stop' || type === 'connectionAck' || type === 'update' || type === 'poi'
    || type === 'complete' || type === 'connect' || type === 'ack' || type === 'badMessage';
}
