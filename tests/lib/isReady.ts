import { Page } from 'puppeteer';

export const isPageReady = async (page: Page, url: string) => {
  await page.goto(url);

  await isElementThere(page, 'main ul li');
};

export const isElementThere = async (
  page: Page,
  selector: string,
  timeout: number = 4000
) =>
  await page.waitForFunction(
    (selector) => !!document.querySelector(selector),
    {
      timeout,
    },
    selector
  );

export const isElementGone = async (
  page: Page,
  selector: string,
  timeout: number = 4000
) =>
  await page.waitForFunction(
    (selector) => !document.querySelector(selector),
    {
      timeout,
    },
    selector
  );

export const isLightboxShown = async (page: Page) => {
  await isElementThere(page, '.basicLightbox--visible');

  return page.$('.basicLightbox--visible');
};

export const isLightboxClosed = async (page: Page) => {
  const lightbox = await isLightboxShown(page);

  // Click on the overlay to close the lightbox
  await lightbox.click({
    offset: {
      x: 10,
      y: 10,
    },
  });

  await isElementGone(page, '.basicLightbox--visible');
};

export const expectToastShown = async (
  page: Page,
  text: string,
  type: string
) => {
  let i = 0;
  await isElementThere(page, '.toast__container .toast');

  const toast = await page.$('.toast__container .toast');

  await expect(toast).not.toBeNull();

  const toastText = await toast.evaluate(
    (toast: HTMLElement) => toast.childNodes[1].textContent
  );

  await expect(toastText).toEqual(text);

  await expect(
    await toast.evaluate(
      (toast: HTMLElement, type: string) =>
        toast.classList.contains(`toast--${type}`),
      type
    )
  ).toBeTruthy();

  await toast.evaluate((toast: HTMLElement) => toast.remove());
};
