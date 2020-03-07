import SerialPort from 'serialport';
import * as config from './config/config';
import * as Misc from './types/misc';
import * as Message from './types/message';
import * as Task from './types/task';
import UpdateHandler from './UpdateHandler';
import XBee from './XBee';

export default class Messenger {
  private static generateHash(targetVehicleId: number, messageId: number): string {
    return `${targetVehicleId}#${messageId}`;
  }

  /** Xbee object to send and receive messages from */
  private xbee: XBee;

  /** ID of the vehicle this Messager is running in */
  private vehicleId: number;

  /** Array of messages mapped by vehicle id to send them to */
  private outbox: Map<number, Message.Message[]>;

  /** Current json message being send to the vehicle mapped by vehicle id */
  private sending: Map<number, Message.JSONMessage>;

  /** Interval function that keeps sending message repeatedly mapped by vehicle id */
  private sendingInterval: Map<number, NodeJS.Timeout>;

  /** ID of message being sent */
  private sendingMessageId: number;

  /** Takes care of events of messages being acknowledged and properly stops sending them */
  private updateHandler: UpdateHandler;

  // The following are all the public fields that could be set when adding a Messenger

  /** Callback when start message is received */
  public onStartMessage?: (message: Message.StartMessage) => boolean;

  /** Callback when add mission message is received */
  public onAddMissionMessage?: (message: Message.AddMissionMessage) => boolean;

  /** Callback when pause message is received */
  public onPauseMessage?: (message: Message.PauseMessage) => boolean;

  /** Callback when resume message is received */
  public onResumeMessage?: (message: Message.ResumeMessage) => boolean;

  /** Callback when stop message is received */
  public onStopMessage?: (message: Message.StopMessage) => boolean;

  /** Callback when update message is received */
  public onUpdateMessage?: (message: Message.UpdateMessage) => void;

  /** Callback when POI message is received */
  public onPOIMessage?: (message: Message.POIMessage) => void;

  /** Callback when complete message is received */
  public onCompleteMessage?: (message: Message.CompleteMessage) => void;

  /** Callback when connect message is received */
  public onConnectMessage?: (message: Message.ConnectMessage) => void;

  /** Callback when bad message is received */
  public onBadMessage?: (message: Message.BadMessage) => void;

  /** Callback when invalid object is received */
  public onReceiveInvalidObject?: (obj: object) => void;

  /**
   * Callback when connection to other vehicle ends.
   *
   * @link https://ground-control-station.readthedocs.io/en/latest/communications/introduction.html#disconnection
   */
  public onVehicleDisconnect?: (vehicleId: number) => void;

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
   * @param onError Callback function when xbee connection encounters an error
   */
  public constructor(
    port: string,
    vehicleId: number,
    options: SerialPort.OpenOptions,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (error?: Error | null) => void,
  ) {
    this.xbee = new XBee(port, options, this.onReceiveObject, onOpen, onClose, onError);
    this.vehicleId = vehicleId;
    this.outbox = new Map<number, Message.JSONMessage[]>();
    this.sending = new Map<number, Message.JSONMessage>();
    this.sendingInterval = new Map<number, NodeJS.Timeout>();
    this.sendingMessageId = 0;
    this.updateHandler = new UpdateHandler();
  }

  public sendStartMessage(targetVehicleId: number, jobType: Misc.JobType): void {
    this.sendMessage(targetVehicleId, {
      type: 'start',
      jobType,
    });
  }

  public sendAddMissionMessage(targetVehicleId: number, task: Task.Task): void {
    this.sendMessage(targetVehicleId, {
      type: 'addMission',
      missionInfo: { ...task },
    });
  }

  public sendPauseMessage(targetVehicleId: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'pause',
    });
  }

  public sendResumeMessage(targetVehicleId: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'resume',
    });
  }

  public sendConnectionAcknowledgementMessage(targetVehicleId: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'connectionAck',
    });
  }

  public sendUpdateMessage(
    targetVehicleId: number,
    lat: number,
    lng: number,
    status: Misc.VehicleStatus,
    alt?: number,
    heading?: number,
    battery?: number,
    errorMessage?: string,
  ): void {
    const updateMessage: Message.UpdateMessage = {
      type: 'update',
      lat,
      lng,
      status,
    };
    if (alt !== undefined) {
      updateMessage.alt = alt;
    }
    if (heading !== undefined) {
      updateMessage.heading = heading;
    }
    if (battery !== undefined) {
      updateMessage.battery = battery;
    }
    if (errorMessage !== undefined) {
      updateMessage.errorMessage = errorMessage;
    }

    this.sendMessage(targetVehicleId, updateMessage);
  }

  public sendPOIMessage(targetVehicleId: number, lat: number, lng: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'poi',
      lat,
      lng,
    });
  }

  public sendCompleteMessage(targetVehicleId: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'complete',
    });
  }

  public sendConnectMessage(targetVehicleId: number, jobsAvailable: Misc.JobType[]): void {
    this.sendMessage(targetVehicleId, {
      type: 'connect',
      jobsAvailable,
    });
  }

  private sendAcknowledgementMessage(targetVehicleId: number, messageId: number): void {
    this.sendMessage(targetVehicleId, {
      type: 'ack',
      ackid: messageId,
    });
  }

  private sendBadMessage(targetVehicleId: number, error?: string): void {
    const badMessage: Message.BadMessage = {
      type: 'badMessage',
    };
    if (error !== undefined) {
      badMessage.error = error;
    }

    this.sendMessage(targetVehicleId, badMessage);
  }

  private sendMessage(targetVehicleId: number, message: Message.Message): void {
    // If Messenger is currently sending a message to the target vehicle, add this message to
    // the outbox and then exit
    if (this.sending.get(targetVehicleId) !== undefined) {
      const outboxList = this.outbox.get(targetVehicleId) || [];
      outboxList.push(message);
      this.outbox.set(targetVehicleId, outboxList);
      return;
    }

    const jsonMessage: Message.JSONMessage = {
      id: this.sendingMessageId,
      sid: this.vehicleId,
      tid: targetVehicleId,
      time: Date.now(),
      ...message,
    };
    this.sendingMessageId += 1;

    // Send message
    if (config.vehicles[targetVehicleId] === undefined) {
      throw new Error('Provided target vehicle ID does not point to a valid vehicle');
    }
    this.xbee.sendObject(jsonMessage, config.vehicles[targetVehicleId].macAddress);

    if (Message.isAcknowledgementMessage(message)
      || Message.isConnectionAcknowledgementMessage(message)
      || Message.isBadMessage(message)) {
      return;
    }

    // Set interval to repeatedly send message until it is acknowledged
    this.sendingInterval.set(targetVehicleId, setInterval(() => {
      this.xbee.sendObject(jsonMessage, '');
    }, config.messageSendRateMs));

    // Add handler to handle the event that this message is acknowledged
    this.updateHandler.addHandler<Message.JSONMessage>(
      Messenger.generateHash(targetVehicleId, jsonMessage.id),
      (ackMessage) => this.processAcknowledgement(ackMessage.sid),
      () => true,
      config.disconnectionTimeMs,
      () => {
        if (this.onVehicleDisconnect !== undefined) {
          this.onVehicleDisconnect(targetVehicleId);
        }
      },
    );
  }

  private onReceiveObject(obj: object): void {
    if (!Message.isJSONMessage(obj)) {
      if ('sid' in obj) {
        this.sendBadMessage(
          (obj as Message.JSONMessage).sid,
          `Invalid message received: ${JSON.stringify(obj)}`,
        );
      }
      this.processReceiveInvalidObject(obj);
      return;
    }

    switch (obj.type) {
      case 'start': {
        if (this.onStartMessage !== undefined) {
          this.onStartMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'addMission': {
        if (this.onAddMissionMessage !== undefined) {
          this.onAddMissionMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'pause': {
        if (this.onPauseMessage !== undefined) {
          this.onPauseMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'resume': {
        if (this.onResumeMessage !== undefined) {
          this.onResumeMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'stop': {
        if (this.onStopMessage !== undefined) {
          this.onStopMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'connectionAck': {
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'update': {
        if (this.onUpdateMessage !== undefined) {
          this.onUpdateMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'poi': {
        if (this.onPOIMessage !== undefined) {
          this.onPOIMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'complete': {
        if (this.onCompleteMessage !== undefined) {
          this.onCompleteMessage(obj);
        }
        this.sendAcknowledgementMessage(obj.sid, obj.id);
        break;
      }
      case 'connect': {
        if (this.onConnectMessage !== undefined) {
          this.onConnectMessage(obj);
        }
        this.sendConnectionAcknowledgementMessage(obj.sid);
        break;
      }
      case 'ack': {
        // Trigger handlers for the message that this message is acknowledging
        this.updateHandler.processEvent(Messenger.generateHash(obj.sid, obj.id), obj);
        break;
      }
      case 'badMessage': {
        if (this.onBadMessage !== undefined) {
          this.onBadMessage(obj);
        }
        break;
      }
      default: break;
    }
  }

  private processReceiveInvalidObject(obj: object): void {
    if (this.onReceiveInvalidObject) {
      this.onReceiveInvalidObject(obj);
    }
  }

  private processAcknowledgement(targetVehicleId: number): void {
    clearInterval(this.sendingInterval.get(targetVehicleId) as NodeJS.Timeout);
    this.sending.delete(targetVehicleId);

    // Send next message to vehicle if its outbox is not empty
    const vehicleOutbox = this.outbox.get(targetVehicleId) || [];
    let nextMessage;
    if (vehicleOutbox.length > 0) {
      nextMessage = vehicleOutbox.shift();
    }
    this.outbox.set(targetVehicleId, vehicleOutbox);
    if (nextMessage !== undefined) {
      this.sendMessage(targetVehicleId, nextMessage);
    }
  }
}
