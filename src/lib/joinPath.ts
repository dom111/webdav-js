export const trimSlashes = (piece) => piece.replace(/^\/+|\/+$/g, '');

export const joinPath = (...pieces) => {
  return `/${pieces
    .map(trimSlashes)
    .filter((piece) => piece)
    .join('/')}`;
};

export default joinPath;
