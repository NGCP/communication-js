/** Amount of time before a vehicle disconnects if it receives no messages from the other */
export declare const disconnectionTimeMs = 20000;
/**
 * Amount of time before a message that requires acknowledgement is sent again if it is not
 * acknowledged
 */
export declare const messageSendRateMs = 10000;
/** Map of vehicles' ID to their information */
export declare const vehicles: {
    [key: number]: {
        macAddress: string;
        name: string;
        type: 'station' | 'plane' | 'rover';
    };
};
