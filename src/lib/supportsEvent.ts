const testElement = document.createElement('span');

export const supportsEvents = (...eventNames: string[]): boolean =>
  eventNames.every((eventName) => supportsEvent(eventName));

export const supportsEvent = (eventName: string): boolean => {
  const attributeName = `on${eventName}`;

  if (!testElement.hasAttribute(attributeName)) {
    testElement.setAttribute(attributeName, '');
  }

  return typeof testElement[`on${eventName}`] === 'function';
};

export default supportsEvent;
