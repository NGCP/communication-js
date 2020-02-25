import SerialPort from 'serialport';
import * as Misc from './types/misc';
import * as Message from './types/message';
import * as Task from './types/task';
export default class Messenger {
    private static generateHash;
    /** Xbee object to send and receive messages from */
    private xbee;
    /** ID of the vehicle this Messager is running in */
    private vehicleId;
    /** Array of messages mapped by vehicle id to send them to */
    private outbox;
    /** Current json message being send to the vehicle mapped by vehicle id */
    private sending;
    /** Interval function that keeps sending message repeatedly mapped by vehicle id */
    private sendingInterval;
    /** ID of message being sent */
    private sendingMessageId;
    /** Takes care of events of messages being acknowledged and properly stops sending them */
    private updateHandler;
    /** Callback when start message is received */
    onStartMessage?: (message: Message.StartMessage) => boolean;
    /** Callback when add mission message is received */
    onAddMissionMessage?: (message: Message.AddMissionMessage) => boolean;
    /** Callback when pause message is received */
    onPauseMessage?: (message: Message.PauseMessage) => boolean;
    /** Callback when resume message is received */
    onResumeMessage?: (message: Message.ResumeMessage) => boolean;
    /** Callback when stop message is received */
    onStopMessage?: (message: Message.StopMessage) => boolean;
    /** Callback when update message is received */
    onUpdateMessage?: (message: Message.UpdateMessage) => void;
    /** Callback when POI message is received */
    onPOIMessage?: (message: Message.POIMessage) => void;
    /** Callback when complete message is received */
    onCompleteMessage?: (message: Message.CompleteMessage) => void;
    /** Callback when connect message is received */
    onConnectMessage?: (message: Message.ConnectMessage) => void;
    /** Callback when bad message is received */
    onBadMessage?: (message: Message.BadMessage) => void;
    /** Callback when invalid object is received */
    onReceiveInvalidObject?: (obj: object) => void;
    /**
     * Callback when connection to other vehicle ends.
     *
     * @link https://ground-control-station.readthedocs.io/en/latest/communications/introduction.html#disconnection
     */
    onVehicleDisconnect?: (vehicleId: number) => void;
    /**
     * Creates an instance of a Messenger, who is in charge of sending messages and receiving messages
     * and forwarding them to callback functions that are provided.
     *
     * @param port The port the xbee will be connected to
     * @param vehicleId The id of this vehicle
     * @param options Additional options for the xbee
     * @param onReceiveObject Callback function when xbee receives a non-null object
     * @param onOpen Callback function when xbee port connection opens
     * @param onClose Callback function when xbee connection closes
     * @param onFailure Callback function when xbee connection fails to open/close
     * @param onError Callback function when xbee connection encounters an error
     */
    constructor(port: string, vehicleId: number, options: SerialPort.OpenOptions, onOpen?: () => void, onClose?: () => void, onFailure?: (error?: Error) => void, onError?: (error: Error) => void);
    sendStartMessage(targetVehicleId: number, jobType: Misc.JobType): void;
    sendAddMissionMessage(targetVehicleId: number, task: Task.Task): void;
    sendPauseMessage(targetVehicleId: number): void;
    sendResumeMessage(targetVehicleId: number): void;
    sendConnectionAcknowledgementMessage(targetVehicleId: number): void;
    sendUpdateMessage(targetVehicleId: number, lat: number, lng: number, status: Misc.VehicleStatus, alt?: number, heading?: number, battery?: number, errorMessage?: string): void;
    sendPOIMessage(targetVehicleId: number, lat: number, lng: number): void;
    sendCompleteMessage(targetVehicleId: number): void;
    sendConnectMessage(targetVehicleId: number, jobsAvailable: Misc.JobType[]): void;
    private sendAcknowledgementMessage;
    private sendBadMessage;
    private sendMessage;
    private onReceiveObject;
    private processReceiveInvalidObject;
    private processAcknowledgement;
}
