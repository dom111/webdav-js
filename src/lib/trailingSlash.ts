export const trailingSlash = (text: string) =>
  text.endsWith('/') ? text : `${text}/`;

export default trailingSlash;
