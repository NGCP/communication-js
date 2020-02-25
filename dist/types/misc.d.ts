/** All different vehicle statuses */
export declare type VehicleStatus = 'ready' | 'error' | 'disconnected' | 'waiting' | 'running' | 'paused';
/** Type guard for VehicleStatus */
export declare function isVehicleStatus(status: string): status is VehicleStatus;
/** Jobs vehicles can have */
export declare type JobType = 'isrSearch' | 'payloadDrop' | 'ugvRescue' | 'uuvRescue' | 'quickScan' | 'detailedSearch' | 'guide';
/** Type guard for JobType */
export declare function isJobType(type: string): type is JobType;
/** All types of tasks */
export declare type TaskType = 'takeoff' | 'loiter' | 'isrSearch' | 'payloadDrop' | 'land' | 'retrieveTarget' | 'deliverTarget' | 'quickScan' | 'detailedSearch';
/** Type guard for TaskType */
export declare function isTaskType(type: string): type is TaskType;
/** All types of messages */
export declare type MessageType = 'start' | 'addMission' | 'pause' | 'resume' | 'stop' | 'connectionAck' | 'update' | 'poi' | 'complete' | 'connect' | 'ack' | 'badMessage';
/** Type guard for MessageType */
export declare function isMessageType(type: string): type is MessageType;
