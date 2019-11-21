export default (() => {
  try {
    document.querySelector(':focus-within');

    return true;
  }
  catch (e) {
    return false;
  }
})();