export const previewItems = (
  currentItem: HTMLElement,
  selector: string = 'li'
): [HTMLElement | null, HTMLElement | null] => {
  if (!currentItem) {
    return [null, null];
  }

  const list = currentItem.parentElement as HTMLElement;

  if (!list) {
    return [null, null];
  }

  const previewItems = Array.from(list.querySelectorAll(selector)),
    currentIndex = previewItems.indexOf(currentItem);

  if (currentIndex === -1) {
    return [null, null];
  }

  const previous =
      currentIndex > 0 ? (previewItems[currentIndex - 1] as HTMLElement) : null,
    next =
      currentIndex < previewItems.length - 1
        ? (previewItems[currentIndex + 1] as HTMLElement)
        : null;

  return [previous, next];
};

export default previewItems;
