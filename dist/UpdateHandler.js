"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Manages handlers for events. Each handler will have callbacks when these
 * events occur as well as callbacks to determine if the handler should still exist after that
 * event (so if it should keep looking out for that event).
 */
var UpdateHandler = /** @class */ (function () {
    function UpdateHandler() {
        this.handlers = new Map();
    }
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
    UpdateHandler.prototype.addHandler = function (eventName, onEvent, shouldRemove, expirationTime, onExpire) {
        var _this = this;
        var handler = {
            onEvent: onEvent,
            shouldRemove: shouldRemove,
            remove: function () { return _this.removeHandler(eventName, handler); },
        };
        if (expirationTime !== undefined) {
            handler.expiry = setTimeout(function () {
                // Deletes the handler when it expires
                var currentHandlers = _this.handlers.get(eventName) || [];
                _this.handlers.set(eventName, currentHandlers.filter(function (lis) { return lis !== handler; }));
                if (onExpire !== undefined) {
                    onExpire();
                }
            }, expirationTime);
        }
        // Adds the handler to the list with the proper event name.
        var currentHandlers = this.handlers.get(eventName) || [];
        currentHandlers.push(handler);
        this.handlers.set(eventName, currentHandlers);
        return handler;
    };
    /**
     * Processes all the handlers associated with the specific event. If more than one handler is
     * watching a specific event then more than one handler callback will be run from this.
     *
     * @param eventName Name of the event that occured.
     * @param value Value associated with that event when it happened.
     * @param options Extra information about the event.
     */
    UpdateHandler.prototype.processEvent = function (eventName, value, options) {
        var currentHandlers = this.handlers.get(eventName) || [];
        this.handlers.set(eventName, currentHandlers.filter(function (handler) {
            handler.onEvent(value, options);
            var shouldRemoveHandler = handler.shouldRemove(value, options);
            if (shouldRemoveHandler && handler.expiry !== undefined) {
                clearTimeout(handler.expiry);
            }
            return !shouldRemoveHandler;
        }));
    };
    /**
     * Removes the handler. The provided name and handler must be the same as the ones used when
     * creating the handler. Called from when the remove() function is called in a handler.
     *
     * @param eventName Name of the event handler is looking for.
     * @param handler Instance of handler to remove.
     */
    UpdateHandler.prototype.removeHandler = function (eventName, handler) {
        if (handler.expiry !== undefined) {
            clearTimeout(handler.expiry);
        }
        // Removes the handler from the event's list of handlers.
        var currentHandlers = this.handlers.get(eventName) || [];
        this.handlers.set(eventName, currentHandlers.filter(function (h) { return handler !== h; }));
    };
    return UpdateHandler;
}());
exports.default = UpdateHandler;
