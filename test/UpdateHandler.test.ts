import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import UpdateHandler from '../src/UpdateHandler';

let updateHandler: UpdateHandler;
let counter: number;

describe('UpdateHandler', () => {
  describe('addHandler() & processEvent()', () => {
    beforeEach(() => {
      counter = 0;
      updateHandler = new UpdateHandler();
    });

    it('should allow adding a handler for a simple one time event', () => {
      updateHandler.addHandler<number>('status', (v) => {
        if (v === 10) {
          counter += 1;
        }
      }, (v) => v === 10);

      expect(counter).to.equal(0);

      // Event should run and remove itself (only runs once).
      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(1);

      // Since event not present, should do nothing.
      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(1);
    });

    it('should not remove the handler if event does not happen', () => {
      updateHandler.addHandler<number>('status', (v) => {
        if (v === 10) {
          counter += 1;
        }
      }, (v) => v === 10);

      expect(counter).to.equal(0);

      updateHandler.processEvent('nope', 10);
      expect(counter).to.equal(0);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(1);
    });

    it('should allow adding handlers for events that can be run, but not get removed immediately', () => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);

      expect(counter).to.equal(0);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(1);

      updateHandler.processEvent('status', -100);
      expect(counter).to.equal(2);

      updateHandler.processEvent('status', 1);
      expect(counter).to.equal(3);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(4);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(4);
    });

    it('should allow adding several handlers for events with different names', () => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);
      updateHandler.addHandler<string>('job', () => { counter += 100; }, (v) => v === 'error');

      expect(counter).to.equal(0);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(1);

      updateHandler.processEvent('job', -100);
      expect(counter).to.equal(101);

      updateHandler.processEvent('status', 1);
      expect(counter).to.equal(102);

      updateHandler.processEvent('job', 'error');
      expect(counter).to.equal(202);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(203);

      updateHandler.processEvent('job', 'error');
      expect(counter).to.equal(203);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(203);
    });

    it('should allow adding several handlers for events with the same name', () => {
      let counter2 = 0;

      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10);
      updateHandler.addHandler<string>('status', () => { counter2 += 100; }, (v) => v === 'error');

      expect(counter).to.equal(0);
      expect(counter2).to.equal(0);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(1);
      expect(counter2).to.equal(100);

      updateHandler.processEvent('status', 1);
      expect(counter).to.equal(2);
      expect(counter2).to.equal(200);

      updateHandler.processEvent('status', 'error');
      expect(counter).to.equal(3);
      expect(counter2).to.equal(300);

      updateHandler.processEvent('status', 'error');
      expect(counter).to.equal(4);
      expect(counter2).to.equal(300);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(5);
      expect(counter2).to.equal(300);

      updateHandler.processEvent('status', 10);
      expect(counter).to.equal(5);
      expect(counter2).to.equal(300);
    });

    it('should allow for events to expire on their own after a certain amount of time', (done) => {
      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10, 25);

      expect(counter).to.equal(0);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(1);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(2);

      setTimeout(() => {
        counter += 100;
        expect(counter).to.equal(102);

        // Handler has expired already so this event should not increment the counter
        updateHandler.processEvent('status', 0);
        expect(counter).to.equal(102);

        done();
      }, 50);
    });

    it('should allow for events to expire on their own after a certain amount of time, with more events for the same key', (done) => {
      let counter2 = 0;

      updateHandler.addHandler<number>('status', () => { counter += 1; }, (v) => v === 10, 25);
      updateHandler.addHandler<string>('status', () => { counter2 += 1; }, (v) => v === 'error');

      expect(counter).to.equal(0);
      expect(counter2).to.equal(0);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(1);
      expect(counter2).to.equal(1);

      updateHandler.processEvent('status', 0);
      expect(counter).to.equal(2);
      expect(counter2).to.equal(2);

      setTimeout(() => {
        counter += 100;
        expect(counter).to.equal(102);
        expect(counter2).to.equal(2);

        updateHandler.processEvent('status', 0);
        expect(counter).to.equal(102);
        expect(counter2).to.equal(3);

        done();
      }, 50);
    });
  });

  describe('removeHandler()', () => {
    it('should allow the removal of the given handler', () => {
      updateHandler = new UpdateHandler();
      let statusCounter = 0;
      let locationCounter = 0;

      const statusHandler = updateHandler.addHandler<number>('status', (v) => { statusCounter += v; }, () => false);

      const locationHandler = updateHandler.addHandler<number>('location', (v) => { locationCounter += v; }, () => false);

      expect(statusCounter).to.equal(0);
      expect(locationCounter).to.equal(0);

      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(1);

      statusHandler.remove();
      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(2);

      locationHandler.remove();
      updateHandler.processEvent('status', 1);
      updateHandler.processEvent('location', 1);

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(2);
    });
  });
});
