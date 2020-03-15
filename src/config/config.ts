/* eslint-disable @typescript-eslint/no-inferrable-types */

/**
 * Amount of time before a vehicle disconnects if it receives no messages from the other. If a
 * message is sent exactly at the time the vehicle should disconnect, the vehicle does not receive
 * the message and still disconnects
 */
export const disconnectionTimeMs: number = 20000;

/**
 * Amount of time before a message that requires acknowledgement is sent again if it is not
 * acknowledged
 */
export const messageSendRateMs: number = 10000;

/** Map of vehicles' ID to their information */
export const vehicles: {
  [key: number]: { macAddress: string; name: string; type: 'station' | 'plane' | 'rover' };
} = {
  0: {
    macAddress: '0013A2004194754E',
    name: 'GCS',
    type: 'station',
  },
  100: {
    macAddress: '0013A2004194783A',
    name: 'Skywalker ISR',
    type: 'plane',
  },
  101: {
    macAddress: '0013A2004194783A',
    name: 'Piper Cub IPD',
    type: 'plane',
  },
  200: {
    macAddress: '0013A200418EA9DE',
    name: 'UGV',
    type: 'rover',
  },
  300: {
    macAddress: '',
    name: 'UUV',
    type: 'rover',
  },
  400: {
    macAddress: '',
    name: 'VTOL 1',
    type: 'plane',
  },
  401: {
    macAddress: '',
    name: 'VTOL 2',
    type: 'plane',
  },
  500: {
    macAddress: '',
    name: 'ROV',
    type: 'plane',
  },
  600: {
    macAddress: '',
    name: 'Blimp',
    type: 'plane',
  },
};
