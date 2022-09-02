export const supportsFocusWithin: boolean = (() => {
  try {
    document.querySelector(':focus-within');

    return true;
  } catch (e) {
    return false;
  }
})();

export default supportsFocusWithin;
