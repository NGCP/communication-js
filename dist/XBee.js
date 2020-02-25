"use strict";
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
var msgpack_lite_1 = __importDefault(require("msgpack-lite"));
var serialport_1 = __importDefault(require("serialport"));
var XBeeAPI = __importStar(require("xbee-api"));
var XBee = /** @class */ (function () {
    /**
     * Creates an instance of an xbee and opens connection.
     *
     * @param port The port the xbee will be connected to
     * @param options Additional options for the xbee
     * @param onReceiveObject Callback function when xbee receives a non-null object
     * @param onOpen Callback function when xbee port connection opens
     * @param onClose Callback function when xbee connection closes
     * @param onFailure Callback function when xbee connection fails to open/close
     * @param onError Callback function when xbee connection encounters an error
     */
    function XBee(port, options, onReceiveObject, onOpen, onClose, onFailure, onError) {
        var _this = this;
        this.onReceiveObject = onReceiveObject;
        this.onOpen = onOpen;
        this.onClose = onClose;
        this.onFailure = onFailure;
        this.onError = onError;
        // Create port and bind xbee-api to it
        this.serialport = new serialport_1.default(port, options, this.failureCallback);
        this.xbee = new XBeeAPI.XBeeAPI();
        this.serialport.pipe(this.xbee.parser);
        this.xbee.builder.pipe(this.serialport);
        this.serialport.on('open', function () { return _this.onOpen; });
        this.serialport.on('close', function () { return _this.onClose; });
        this.serialport.on('error', function (error) {
            if (_this.onError) {
                _this.onError(error);
            }
        });
        // Will only run onReceiveData function if the data received is a ZigBee receive packet
        // and is a valid MessagePack-encoded JSON
        this.xbee.parser.on('data', function (frame) {
            if (frame.type === XBeeAPI.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET) {
                try {
                    var obj = JSON.parse(msgpack_lite_1.default.decode(frame.data));
                    if (typeof obj === 'object' && obj !== null) {
                        _this.onReceiveObject(obj);
                    }
                }
                catch (e) {
                    // eslint-disable-line no-empty
                }
            }
        });
    }
    XBee.prototype.openConnection = function () {
        if (this.serialport.isOpen)
            return false;
        this.serialport.open(this.failureCallback);
        return true;
    };
    XBee.prototype.closeConnection = function () {
        if (!this.serialport.isOpen)
            return false;
        this.serialport.open(this.failureCallback);
        return true;
    };
    /**
     * Sends JSON compressed using MessagePack https://msgpack.org/index.html
     * Sends packet as a ZigBee transmit request
     *
     * @param data The object being sent, will be compressed with MessagePack
     * @param address 64-bit MAC address of the XBee that the message is being sent to
     */
    XBee.prototype.sendData = function (data, address) {
        if (!this.serialport.isOpen)
            return;
        this.xbee.builder.write({
            type: XBeeAPI.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
            destination64: address,
            data: msgpack_lite_1.default.encode(JSON.stringify(data)),
        });
    };
    XBee.prototype.failureCallback = function (error) {
        if (error && this.onFailure) {
            this.onFailure(error);
        }
    };
    return XBee;
}());
exports.default = XBee;
