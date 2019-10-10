export default class EventObject {
  #events;
  #validEvents;

  constructor(validEvents = []) {
    this.#events = {};
    this.#validEvents = validEvents;
  }

  hasEvent(event) {
    return this.#events.hasOwnProperty(event);
  }

  isValidEvent(event) {
    return this.#validEvents.length === 0 || this.#validEvents.includes(event);
  }

  on(event, listener) {
    if (!this.isValidEvent(event)) {
      throw TypeError(`'${event}' is not a valid event.`);
    }

    if (!this.hasEvent(event)) {
      this.#events[event] = [];
    }

    this.#events[event].push(listener);
  }

  off(event, listener = null) {
    if (!this.hasEvent(event)) {
      return;
    }

    if (listener === null) {
      return this.#events[event] = [];
    }

    this.#events[event] = this.#events.filter((eventListener) => eventListener !== listener);
  }

  trigger(event, ...data) {
    if (this.hasEvent(event)) {
      this.#events[event].forEach((listener) => listener(...data));
    }
  }
}
