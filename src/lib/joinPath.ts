export const trimSlashes = (piece: string): string =>
  piece.replace(/^\/+|\/+$/g, '');

export const joinPath = (...pieces: string[]): string =>
  `/${pieces
    .map(trimSlashes)
    .filter((piece) => piece)
    .join('/')}`;

export default joinPath;
