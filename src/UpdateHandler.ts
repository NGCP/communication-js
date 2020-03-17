/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Handler<T> {
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

  public constructor() {
    this.handlers = new Map<string, Handler<any>[]>();
  }

  /**
   * Adds a new handler to check for a specific event.
   *
   * @param eventName Name of the event to look out for.
   * @param onEvent Callback function when the handler sees event happening.
   * @param shouldRemove Callback function to determine if handler should be removed.
   * @param expirationTime Amount of time for the handler to expire, in milliseconds.
   * @param onExpire Callback function when handler expires.
   * @returns The handler created. Normally never need to access the handler itself unless it
   *          needs to be manually removed using the handler.remove() function.
   */
  public addHandler<T>(
    eventName: string,
    onEvent: (value: T, options?: object) => void,
    shouldRemove: (value: T, options?: object) => boolean,
    expirationTime?: number,
    onExpire?: () => void,
  ): Handler<T> {
    const handler: Handler<T> = {
      onEvent,
      shouldRemove,
      remove: () => this.removeHandler(eventName, handler),
    };

    if (expirationTime !== undefined) {
      handler.expiry = setTimeout(() => {
        // Deletes the handler when it expires then runs callback onExpire function
        handler.remove();
        if (onExpire !== undefined) {
          onExpire();
        }
      }, expirationTime);
    }

    const currentHandlers = this.handlers.get(eventName) || [];
    currentHandlers.push(handler);
    this.handlers.set(eventName, currentHandlers);

    return handler;
  }

  /**
   * Processes all the handlers associated with the specific event. If more than one handler is
   * watching a specific event then more than one handler callback will be run from this.
   *
   * @param eventName Name of the event that occured.
   * @param value Value associated with that event when it happened.
   * @param options Extra information about the event.
   */
  public processEvent<T>(eventName: string, value: T, options?: object): void {
    const currentHandlers = this.handlers.get(eventName);
    if (currentHandlers === undefined) {
      return;
    }

    currentHandlers.forEach((handler) => {
      handler.onEvent(value, options);
      if (handler.shouldRemove(value, options)) {
        handler.remove();
      }
    });
  }

  /** Removes all existing handlers */
  public clearHandlers(): void {
    this.handlers.forEach((handlers) => {
      handlers.forEach((handler) => handler.remove());
    });
  }

  /**
   * Removes the handler. The provided name and handler must be the same as the ones used when
   * creating the handler. Called from when the remove() function is called in a handler.
   *
   * @param eventName Name of the event handler is looking for.
   * @param handler Instance of handler to remove.
   */
  private removeHandler<T>(eventName: string, handler: Handler<T>): void {
    if (handler.expiry !== undefined) {
      clearTimeout(handler.expiry);
    }

    const currentHandlers = this.handlers.get(eventName);
    if (currentHandlers === undefined) {
      throw new Error('Tried removing a handler for an event that does not exist');
    }

    const newHandlers = currentHandlers.filter((h) => handler !== h);
    if (newHandlers.length === 0) {
      this.handlers.delete(eventName);
    } else {
      this.handlers.set(eventName, newHandlers);
    }
  }
}
