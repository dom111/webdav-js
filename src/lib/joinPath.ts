export const trimSlashes = (piece: string) => piece.replace(/^\/+|\/+$/g, '');

export const joinPath = (...pieces: string[]) =>
  `/${pieces
    .map(trimSlashes)
    .filter((piece) => piece)
    .join('/')}`;

export default joinPath;
