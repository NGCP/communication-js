import { assert } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import UpdateHandler from '../src/UpdateHandler';

let updateHandler: UpdateHandler;
let counter: number;

describe('UpdateHandler', () => {
  beforeEach(() => {
    updateHandler = new UpdateHandler();
    counter = 0;
  });

  describe('#addHandler()', () => {
    it('should store all handlers in a map', () => {
      const handler = updateHandler.addHandler<number>(
        'status',
        (v) => { counter += v; },
        () => false,
      );

      assert.equal(updateHandler.handlers.size, 1);
      assert.isDefined(
        updateHandler.handlers.get('status'),
        'missing value for "status" in the updateHandler',
      );
      assert.deepEqual(
        updateHandler.handlers.get('status'),
        [handler],
        `handler in "status" not the same has handler added, found ${updateHandler.handlers.get('status')}`,
      );
    });

    it('should have no handler when none is added', () => {
      updateHandler = new UpdateHandler();
      assert.equal(updateHandler.handlers.size, 0);
    });

    it('should add an expiring handler properly', (done) => {
      updateHandler.addHandler<number>(
        'status',
        (v) => { counter += v; },
        () => false,
        10,
        () => { counter += 1; },
      );

      setTimeout(() => {
        assert.equal(counter, 1, `counter should be 1 after handler expires, is ${counter}`);
        assert.isUndefined(updateHandler.handlers.get('status'));
        done();
      }, 20);
    });
  });

  describe('#processEvent()', () => {
    it('should allow adding a handler for a simple one time event', () => {
      updateHandler.addHandler<number>('status', (v) => {
        if (v === 10) {
          counter += 1;
        }
      }, (v) => v === 10);

      assert.equal(counter, 0);

      // Event should run and remove itself (only runs once).
      updateHandler.processEvent('status', 10);
      assert.equal(counter, 1);

      // Since event not present, should do nothing.
      updateHandler.processEvent('status', 10);
      assert.equal(counter, 1);
    });

    it('should not remove the handler if event does not happen', () => {
      updateHandler.addHandler<number>('status', (v) => {
        if (v === 10) {
          counter += 1;
        }
      }, (v) => v === 10);

      assert.equal(counter, 0);

      updateHandler.processEvent('nope', 10);
      assert.equal(counter, 0);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 1);
    });

    it('should allow adding handlers for events that can be run, but not get removed immediately', () => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);

      assert.equal(counter, 0);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 1);

      updateHandler.processEvent('status', -100);
      assert.equal(counter, 2);

      updateHandler.processEvent('status', 1);
      assert.equal(counter, 3);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 4);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 4);
    });

    it('should allow adding several handlers for events with different names', () => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);
      updateHandler.addHandler<string>('job', () => { counter += 100; }, (v) => v === 'error');

      assert.equal(counter, 0);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 1);

      updateHandler.processEvent('job', -100);
      assert.equal(counter, 101);

      updateHandler.processEvent('status', 1);
      assert.equal(counter, 102);

      updateHandler.processEvent('job', 'error');
      assert.equal(counter, 202);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 203);

      updateHandler.processEvent('job', 'error');
      assert.equal(counter, 203);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 203);
    });

    it('should allow adding several handlers for events with the same name', () => {
      let counter2 = 0;

      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);
      updateHandler.addHandler<string>('status', () => { counter2 += 100; }, (v) => v === 'error');

      assert.equal(counter, 0);
      assert.equal(counter2, 0);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 1);
      assert.equal(counter2, 100);

      updateHandler.processEvent('status', 1);
      assert.equal(counter, 2);
      assert.equal(counter2, 200);

      updateHandler.processEvent('status', 'error');
      assert.equal(counter, 3);
      assert.equal(counter2, 300);

      updateHandler.processEvent('status', 'error');
      assert.equal(counter, 4);
      assert.equal(counter2, 300);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 5);
      assert.equal(counter2, 300);

      updateHandler.processEvent('status', 10);
      assert.equal(counter, 5);
      assert.equal(counter2, 300);
    });

    it('should allow for events to expire on their own after a certain amount of time', (done) => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10, 10);

      assert.equal(counter, 0);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 1);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 2);

      setTimeout(() => {
        counter += 100;
        assert.equal(counter, 102);

        // Handler has expired already so this event should not increment the counter
        updateHandler.processEvent('status', 0);
        assert.equal(counter, 102);

        done();
      }, 20);
    });

    it('should allow for events to expire on their own after a certain amount of time, with more events for the same key', (done) => {
      let counter2 = 0;

      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10, 10);
      updateHandler.addHandler<string>('status', () => { counter2 += 1; }, (v) => v === 'error');

      assert.equal(counter, 0);
      assert.equal(counter2, 0);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 1);
      assert.equal(counter2, 1);

      updateHandler.processEvent('status', 0);
      assert.equal(counter, 2);
      assert.equal(counter2, 2);

      setTimeout(() => {
        counter += 100;
        assert.equal(counter, 102);
        assert.equal(counter2, 2);

        updateHandler.processEvent('status', 0);
        assert.equal(counter, 102);
        assert.equal(counter2, 3);

        done();
      }, 20);
    });

    it('should not let handler expiry run if handler was removed from event', (done) => {
      updateHandler.addHandler<number>(
        'status',
        (v) => { counter += v; },
        () => true,
        10,
        () => { counter += 1; },
      );

      updateHandler.processEvent('status', 0);

      setTimeout(() => {
        assert.equal(counter, 0, `counter should be 0 since expiry did not run, is ${counter}`);
        done();
      }, 20);
    });
  });

  describe('#removeHandler()', () => {
    it('should allow the removal of the given handler', () => {
      let statusCounter = 0;
      let locationCounter = 0;

      const statusHandler = updateHandler.addHandler<number>(
        'status',
        (v) => { statusCounter += v; },
        () => false,
      );

      const locationHandler = updateHandler.addHandler<number>(
        'location',
        (v) => { locationCounter += v; },
        () => false,
      );

      assert.equal(statusCounter, 0);
      assert.equal(locationCounter, 0);

      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      assert.equal(statusCounter, 1);
      assert.equal(locationCounter, 1);

      statusHandler.remove();
      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      assert.equal(statusCounter, 1);
      assert.equal(locationCounter, 2);

      locationHandler.remove();
      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      assert.equal(statusCounter, 1);
      assert.equal(locationCounter, 2);
    });

    it('should not let handler expiry run if handler was deleted', (done) => {
      const handler = updateHandler.addHandler<number>(
        'status',
        (v) => { counter += v; },
        () => true,
        10,
        () => { counter += 1; },
      );

      handler.remove();

      setTimeout(() => {
        assert.equal(counter, 0, `counter should be 0 since expiry did not run, is ${counter}`);
        assert.isUndefined(updateHandler.handlers.get('status'));
        done();
      }, 20);
    });

    it('should delete the event if no more handlers exist for it', () => {
      const handler = updateHandler.addHandler<number>(
        'status', () => { counter += 1; }, (v) => v === 10,
      );
      assert.equal(updateHandler.handlers.size, 1);

      handler.remove();
      assert.equal(updateHandler.handlers.size, 0);
    });

    it('should not delete the event if more handlers exist for it', () => {
      const handler = updateHandler.addHandler<number>(
        'status', () => { counter += 1; }, (v) => v === 10,
      );
      const handler2 = updateHandler.addHandler<number>(
        'status', () => { counter += 2; }, (v) => v === 20,
      );
      assert.equal(updateHandler.handlers.size, 1);

      handler.remove();
      assert.equal(updateHandler.handlers.size, 1);
      assert.deepEqual(updateHandler.handlers.get('status'), [handler2]);
    });

    it('should throw error if handler for non-existing event is deleted', () => {
      const handler = updateHandler.addHandler<number>(
        'status', () => { counter += 1; }, (v) => v === 10,
      );
      assert.equal(updateHandler.handlers.size, 1);

      updateHandler.handlers.delete('status');
      assert.equal(updateHandler.handlers.size, 0);

      assert.throws(
        () => handler.remove(),
        Error,
        'Tried removing a handler for an event that does not exist',
      );
    });
  });

  describe('#clearHandlers()', () => {
    it('should remove all existing handlers', () => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);
      assert.equal(updateHandler.handlers.size, 1);
      updateHandler.clearHandlers();
      assert.equal(updateHandler.handlers.size, 0);
    });
  });
});
