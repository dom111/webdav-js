export const joinPath = (...pieces: string[]): string =>
  leadingSlash(
    pieces
      .map(trimSlashes)
      .filter((piece) => piece)
      .join('/')
  );

export const leadingAndTrailingSlash = (text: string): string =>
  leadingSlash(trailingSlash(text));

export const leadingSlash = (text: string): string =>
  text.startsWith('/') ? text : `/${text}`;

export const pathAndName = (path: string): [string, string] => {
  const pathParts = joinPath(path).split(/\//),
    file = pathParts.pop();

  return [joinPath(...pathParts), file];
};

export const trailingSlash = (text: string): string =>
  text.endsWith('/') ? text : `${text}/`;

export const trimSlashes = (piece: string): string =>
  piece.replace(/^\/+|\/+$/g, '');

export default joinPath;
