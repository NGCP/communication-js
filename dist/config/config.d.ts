declare const _default: {
    /** Amount of time before a vehicle disconnects if it receives no messages from the other */
    disconnectionTimeMs: number;
    /**
     * Amount of time before a message that requires acknowledgement is sent again if it is not
     * acknowledged
     */
    messageSendRateMs: number;
    /** Map of vehicles' ID to their information */
    vehicles: {
        [key: number]: {
            macAddress: string;
            name: string;
            type: "station" | "plane" | "rover";
        };
    };
};
export default _default;
