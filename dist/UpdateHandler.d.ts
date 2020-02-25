/// <reference types="node" />
interface Handler<T> {
    /** Callback function when an event occurs. */
    onEvent: (value: T, options?: object) => void;
    /** Callback function to determine if event should be removed from handler. */
    shouldRemove: (value: T, options?: object) => boolean;
    /** Function to remove the handler. Pre-defined already in the UpdateHandler class. */
    remove: () => void;
    /** Timeout function when the handler expires. */
    expiry?: NodeJS.Timeout;
}
/**
 * Manages handlers for events. Each handler will have callbacks when these
 * events occur as well as callbacks to determine if the handler should still exist after that
 * event (so if it should keep looking out for that event).
 */
export default class UpdateHandler {
    handlers: Map<string, Handler<any>[]>;
    constructor();
    /**
     * Adds a new handler to check for a specific event.
     *
     * @param eventName Name of the event to look out for.
     * @param onEvent Callback function when the handler sees event happening.
     * @param shouldRemove Callback function to determine if handler should be removed.
     * @param expirationTime Amount of time for the handler to expire.
     * @param onExpire Callback function when handler expires.
     * @returns The handler created. Normally never need to access the handler itself unless it
     *          needs to be manually removed using the handler.remove() function.
     */
    addHandler<T>(eventName: string, onEvent: (value: T, options?: object) => void, shouldRemove: (value: T, options?: object) => boolean, expirationTime?: number, onExpire?: () => void): Handler<T>;
    /**
     * Processes all the handlers associated with the specific event. If more than one handler is
     * watching a specific event then more than one handler callback will be run from this.
     *
     * @param eventName Name of the event that occured.
     * @param value Value associated with that event when it happened.
     * @param options Extra information about the event.
     */
    processEvent<T>(eventName: string, value: T, options?: object): void;
    /**
     * Removes the handler. The provided name and handler must be the same as the ones used when
     * creating the handler. Called from when the remove() function is called in a handler.
     *
     * @param eventName Name of the event handler is looking for.
     * @param handler Instance of handler to remove.
     */
    private removeHandler;
}
export {};
