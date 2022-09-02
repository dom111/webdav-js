export const trailingSlash = (text: string): string =>
  text.endsWith('/') ? text : `${text}/`;

export default trailingSlash;
