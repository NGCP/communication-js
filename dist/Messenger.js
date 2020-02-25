"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config/config"));
var Message = __importStar(require("./types/message"));
var UpdateHandler_1 = __importDefault(require("./UpdateHandler"));
var XBee_1 = __importDefault(require("./XBee"));
var Messenger = /** @class */ (function () {
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
    function Messenger(port, vehicleId, options, onOpen, onClose, onFailure, onError) {
        this.xbee = new XBee_1.default(port, options, this.onReceiveObject, onOpen, onClose, onFailure, onError);
        this.vehicleId = vehicleId;
        this.outbox = new Map();
        this.sending = new Map();
        this.sendingInterval = new Map();
        this.sendingMessageId = 0;
        this.updateHandler = new UpdateHandler_1.default();
    }
    Messenger.generateHash = function (targetVehicleId, messageId) {
        return targetVehicleId + "#" + messageId;
    };
    Messenger.prototype.sendStartMessage = function (targetVehicleId, jobType) {
        this.sendMessage(targetVehicleId, {
            type: 'start',
            jobType: jobType,
        });
    };
    Messenger.prototype.sendAddMissionMessage = function (targetVehicleId, task) {
        this.sendMessage(targetVehicleId, {
            type: 'addMission',
            missionInfo: __assign({}, task),
        });
    };
    Messenger.prototype.sendPauseMessage = function (targetVehicleId) {
        this.sendMessage(targetVehicleId, {
            type: 'pause',
        });
    };
    Messenger.prototype.sendResumeMessage = function (targetVehicleId) {
        this.sendMessage(targetVehicleId, {
            type: 'resume',
        });
    };
    Messenger.prototype.sendConnectionAcknowledgementMessage = function (targetVehicleId) {
        this.sendMessage(targetVehicleId, {
            type: 'connectionAck',
        });
    };
    Messenger.prototype.sendUpdateMessage = function (targetVehicleId, lat, lng, status, alt, heading, battery, errorMessage) {
        var updateMessage = {
            type: 'update',
            lat: lat,
            lng: lng,
            status: status,
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
    };
    Messenger.prototype.sendPOIMessage = function (targetVehicleId, lat, lng) {
        this.sendMessage(targetVehicleId, {
            type: 'poi',
            lat: lat,
            lng: lng,
        });
    };
    Messenger.prototype.sendCompleteMessage = function (targetVehicleId) {
        this.sendMessage(targetVehicleId, {
            type: 'complete',
        });
    };
    Messenger.prototype.sendConnectMessage = function (targetVehicleId, jobsAvailable) {
        this.sendMessage(targetVehicleId, {
            type: 'connect',
            jobsAvailable: jobsAvailable,
        });
    };
    Messenger.prototype.sendAcknowledgementMessage = function (targetVehicleId, messageId) {
        this.sendMessage(targetVehicleId, {
            type: 'ack',
            ackid: messageId,
        });
    };
    Messenger.prototype.sendBadMessage = function (targetVehicleId, error) {
        var badMessage = {
            type: 'badMessage',
        };
        if (error !== undefined) {
            badMessage.error = error;
        }
        this.sendMessage(targetVehicleId, badMessage);
    };
    Messenger.prototype.sendMessage = function (targetVehicleId, message) {
        var _this = this;
        // If Messenger is currently sending a message to the target vehicle, add this message to
        // the outbox and then exit
        if (this.sending.get(targetVehicleId) !== undefined) {
            var outboxList = this.outbox.get(targetVehicleId) || [];
            outboxList.push(message);
            this.outbox.set(targetVehicleId, outboxList);
            return;
        }
        var jsonMessage = __assign({ id: this.sendingMessageId, sid: this.vehicleId, tid: targetVehicleId, time: Date.now() }, message);
        this.sendingMessageId += 1;
        // Send message
        if (config_1.default.vehicles[targetVehicleId] === undefined) {
            throw new Error('Provided target vehicle ID does not point to a valid vehicle');
        }
        this.xbee.sendData(jsonMessage, config_1.default.vehicles[targetVehicleId].macAddress);
        if (Message.isAcknowledgementMessage(message)
            || Message.isConnectionAcknowledgementMessage(message)
            || Message.isBadMessage(message)) {
            return;
        }
        // Set interval to repeatedly send message until it is acknowledged
        this.sendingInterval.set(targetVehicleId, setInterval(function () {
            _this.xbee.sendData(jsonMessage, '');
        }, config_1.default.messageSendRateMs));
        // Add handler to handle the event that this message is acknowledged
        this.updateHandler.addHandler(Messenger.generateHash(targetVehicleId, jsonMessage.id), function (ackMessage) { return _this.processAcknowledgement(ackMessage.sid); }, function () { return true; }, config_1.default.disconnectionTimeMs, function () {
            if (_this.onVehicleDisconnect !== undefined) {
                _this.onVehicleDisconnect(targetVehicleId);
            }
        });
    };
    Messenger.prototype.onReceiveObject = function (obj) {
        if (!Message.isJSONMessage(obj)) {
            if ('sid' in obj) {
                this.sendBadMessage(obj.sid, "Invalid message received: " + JSON.stringify(obj));
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
    };
    Messenger.prototype.processReceiveInvalidObject = function (obj) {
        if (this.onReceiveInvalidObject) {
            this.onReceiveInvalidObject(obj);
        }
    };
    Messenger.prototype.processAcknowledgement = function (targetVehicleId) {
        clearInterval(this.sendingInterval.get(targetVehicleId));
        this.sending.delete(targetVehicleId);
        // Send next message to vehicle if its outbox is not empty
        var vehicleOutbox = this.outbox.get(targetVehicleId) || [];
        var nextMessage;
        if (vehicleOutbox.length > 0) {
            nextMessage = vehicleOutbox.shift();
        }
        this.outbox.set(targetVehicleId, vehicleOutbox);
        if (nextMessage !== undefined) {
            this.sendMessage(targetVehicleId, nextMessage);
        }
    };
    return Messenger;
}());
exports.default = Messenger;
