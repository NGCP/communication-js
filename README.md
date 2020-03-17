# NGCP Communication for JavaScript

[![Build Status](https://travis-ci.org/NGCP/communication-js.svg?branch=master)](https://travis-ci.org/NGCP/communication-js)
[![Coverage Status](https://coveralls.io/repos/github/NGCP/communication-js/badge.svg?branch=master&service=github)](https://coveralls.io/github/NGCP/communication-js?branch=master)
[![dependencies Status](https://david-dm.org/NGCP/communication-js/status.svg)](https://david-dm.org/NGCP/communication-js)
[![devDependencies Status](https://david-dm.org/NGCP/communication-js/dev-status.svg)](https://david-dm.org/NGCP/communication-js?type=dev)

## Introduction

NGCP's communication framework for JSON-based communication in Node.js JavaScript framework.

```bash
npm install ngcp-communication-js
```

## Messenger class

This package includes the `Messenger` class to send and receive messages to other vehicles using the
[JSON communication system][]. You can create an instance of the `Messenger` class by doing the
following:

```javascript
import { Messenger } from 'ngcp-communication-js';

const MY_PORT = 'PORT';
const MY_VEHICLE_ID = 0;

const messenger = new Messenger(MY_PORT, MY_VEHICLE_ID);
```

### Receiving messages

You can attach callbacks to the instance that are invoked whenever you receive a message/object or
when a vehicle disconnects (fails to send a message within a certain amount of time).

```javascript
messenger.onStartMessage = (message) => {
  // ...
};
```

The following are the callbacks you can use:

  - **messenger.onConnectionAcknowledgementMessage(message)**
      - Invoked when you receive a connection acknowledgement message

  - **messenger.onStartMessage(message)**
      - Invoked when you receive a start message

  - **messenger.onAddMissionMessage(message)**
      - Invoked when you receive an add mission message

  - **messenger.onPauseMessage(message)**
      - Invoked when you receive a pause message

  - **messenger.onResumeMessage(message)**
      - Invoked when you receive a resume message

  - **messenger.onStopMessage(message)**
      - Invoked when you receive a stop message

  - **messenger.onUpdateMessage(message)**
      - Invoked when you receive an update message

  - **messenger.onPOIMessage(message)**
      - Invoked when you receive a point of interest (POI) message

  - **messenger.onCompleteMessage(message)**
      - Invoked when you receive a complete message

  - **messenger.onConnectMessage(message)**
      - Invoked when you receive a connect message

  - **messenger.onBadMessage(message)**
      - Invoked when you receive a bad message

  - **messenger.onReceiveInvalidObject(object)**
      - Invoked when you receive an object that is not a message. The object is not `undefined`
      and is not `null`. It will always be at least an empty object `{}`.

### Vehicle disconnection

There is a callback that is invoked whenever a vehicle disconnects from you:

  - **messenger.onVehicleDisconnect(vehicleId)**
      - `vehicleId` is the ID of the
      disconnected vehicle

### Sending messages

You can also call functions to send messages. They all require the vehicle ID of the vehicle you
are sending the message to, as well as extra information if the message requires it.

```javascript
const TARGET_VEHICLE_ID = 100;
const ISR_SEARCH_JOB_TYPE = 'isrSearch';

messenger.sendStartMessage(TARGET_VEHICLE_ID, ISR_SEARCH_JOB_TYPE)
```

The following are all the functions you can call:

  - **messenger.sendConnectionAcknowledgementMessage(targetVehicleId)**

  - **messenger.sendStartMessage(targetVehicleId, jobType)**

  - **messenger.sendAddMissionMessage(targetVehicleId, task)**

  - **sendPauseMessage(targetVehicleId)**

  - **sendResumeMessage(targetVehicleId)**

  - **sendStopMessage(targetVehicleId)**

  - **sendUpdateMessage(targetVehicleId, lat, lng, status, extras)**
      - extras is an object containing `alt`, `heading`, `battery`, and `errorMessage` which are
      all optional fields for an update message

  - **sendPOIMessage(targetVehicleId, lat, lng)**

  - **sendCompleteMessage(targetVehicleId)**

  - **sendConnectMessage(targetVehicleId, jobsAvailable)**

All types for the messages are defined in the wiki
[here](https://ground-control-station.readthedocs.io/en/latest/communications/messages/base-message/).

All types for the jobs and tasks are defined in the wiki [here](https://ground-control-station.readthedocs.io/en/latest/communications/jobs-tasks/jobs-vs-tasks/).

## UpdateHandler class

This package also includes the `UpdateHandler` class to asynchronously listen to events and have
callbacks:

```javascript
import { UpdateHandler } from 'ngcp-communication-js';

const updateHandler = new UpdateHandler();

const EXPIRATION_TIME_MS = 1000; // 1 second

// function to call if an event happens for this handler
function onEvent(value, options) {
}

// function to call if event should remove this handler
function shouldRemove(value, options) {
}

// function to call if this handler expires (this is optional)
function onExpire() {
}

// the expiration time and onExpire arguments are completely optional
updateHandler.addHandler('yourEventName', onEvent, shouldRemove, EXPIRATION_TIME_MS, onExpire);

const value = ''; // can be any value
const options = { something: 10 };

// you can call this function to invoke an event
updateHandler.processEvent('yourEventName', value, options);
```

## Other features

### Config

This package has static configurations included with it that you can use:

```javascript
import { Config } from 'ngcp-communication-config'

const { disconnectionTimeMs, messageSendRateMs, vehicles } = Config;
```

  - **disconnectionTimeMs**: amount of time (in milliseconds) before a vehicle disconnects if it
   receives no messages from the other

  - **messageSendRateMs**: amount of time message is sent again if it is not acknowledged yet (not
    all messages require acknowledgement so this does not apply to all messages)

  - **vehicles**: mapping of vehicle ID to vehicle information, which includes:
      - **macAddress**: MAC address of the vehicle
      - **name**: name of the vehicle
      - **type**: type of vehicle, either `station`, `plane`, or `rover`

### TypeScript support

This package includes TypeScript typings for any TypeScript projects:

```typescript
import { Message, Task } from 'ngcp-communication-js';

const pauseMessage: Message.PauseMessage = { type: 'pause' };

const loiterTask: Task.LoiterTask = {
  taskType: 'loiter',
  lat: 14.54321812347,
  lng: 5.453286523,
  alt: 50.254387612,
  radius: 3.5634923,
  direction: 0
}
```

## License

[MIT](https://github.com/NGCP/communication-js/blob/master/LICENSE)

[acknowledgement messages]: https://ground-control-station.readthedocs.io/en/latest/communications/messages/other-messages/#acknowledgement-message
[JSON communication system]: https://ground-control-station.readthedocs.io/en/latest/communications/introduction/
[vehicle ID]: https://ground-control-station.readthedocs.io/en/latest/communications/vehicle-ids/
