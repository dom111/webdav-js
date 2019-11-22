const events = {};

export default class EventObject {
  hasEvent(event) {
    return event in events;
  }

  on(event, listener) {
    if (! this.hasEvent(event)) {
      events[event] = [];
    }

    events[event].push(listener);
  }

  off(event, listener = null) {
    if (! this.hasEvent(event)) {
      return;
    }

    if (listener === null) {
      return events[event] = [];
    }

    events[event] = events.filter((eventListener) => eventListener !== listener);
  }

  trigger(event, ...data) {
    if (this.hasEvent(event)) {
      let stopped = false;

      events[event].forEach((listener) => {
        if (stopped) {
          return;
        }

        if (listener(...data) === false) {
          stopped = true;
        }
      });
    }
  }
}
