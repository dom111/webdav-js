import { Page } from 'puppeteer';

export const isPageReady = async (page: Page, url: string) => {
  await page.goto(url);

  await isElementThere(page, 'main ul li');
};

export const isElementThere = async (page: Page, selector: string) =>
  await page.waitForFunction(
    (selector) => !!document.querySelector(selector),
    {},
    selector
  );

export const isElementGone = async (page: Page, selector: string) =>
  await page.waitForFunction(
    (selector) => !document.querySelector(selector),
    {},
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
  await page.waitForTimeout(100);

  const toast = await page.$('.toast__container .toast');

  await expect(
    await toast.evaluate((toast) => toast.childNodes[1].textContent)
  ).toEqual(text);

  await expect(
    await toast.evaluate(
      (toast, type: string) => toast.classList.contains(`toast--${type}`),
      type
    )
  ).toBeTruthy();

  await toast.evaluate((toast) => toast.remove());
};
