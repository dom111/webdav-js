import {
  isLightboxClosed,
  isPageReady,
  isLightboxShown,
  expectToastShown,
  isElementGone,
  isElementThere,
} from '../lib/isReady';
import { ElementHandle } from 'puppeteer';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080/',
  DESTINATION_FONT_FILE = '/tmp/BlackAndWhitePicture-Regular.ttf';

describe('WebDAV.js', () => {
  describe('List', () => {
    it('should be possible to preview items', async () => {
      // Wait for page JS to replace page contents
      await isPageReady(page, BASE_URL);

      await (
        [
          [
            '[data-full-path="/0.jpg"]',
            async (lightbox: ElementHandle) => {
              await expect(await lightbox.$('img')).toBeTruthy();
            },
          ],
          [
            '[data-full-path="/BlackAndWhitePicture-Regular.ttf"]',
            async (lightbox: ElementHandle) => {
              await expect(await lightbox.$('img')).toBeFalsy();
              await expect(await lightbox.$$('style')).toHaveLength(1);
              await expect(await lightbox.$$('h1')).toHaveLength(1);
              await expect(await lightbox.$$('p')).toHaveLength(4);
            },
          ],
          [
            '[data-full-path="/dummy.pdf"]',
            async (lightbox: ElementHandle) => {
              await expect(await lightbox.$('iframe')).toBeTruthy();
            },
          ],
          [
            '[data-full-path="/style.css"]',
            async (lightbox: ElementHandle) => {
              await expect(await lightbox.$('pre.language-css')).toBeTruthy();
            },
          ],
          [
            '[data-full-path="/video.mp4"]',
            async (lightbox: ElementHandle) => {
              await expect(await lightbox.$('video[autoplay]')).toBeTruthy();
            },
          ],
        ] as [string, (lightbox: ElementHandle) => Promise<void>][]
      ).reduce(
        async (
          previous: Promise<void>,
          [selector, expectation]
        ): Promise<void> => {
          await previous;

          await page.click(selector);

          await expectation(await isLightboxShown(page));

          await isLightboxClosed(page);

          await page.waitForTimeout(500);
        },
        Promise.resolve(null)
      );
    });

    it('should be possible to create a new navigable directory, rename it and delete it', async () => {
      await isPageReady(page, BASE_URL);

      page.once(
        'dialog',
        async (dialog) => await dialog.accept('new-directory')
      );

      await page.click('.create-directory');

      await isElementThere(page, '[data-full-path="/new-directory/"]');

      await expectToastShown(
        page,
        `'new-directory' has been created.`,
        'success'
      );

      await page.click('[data-full-path="/new-directory/"]');


      await page.waitForTimeout(200);

      await expect(await page.$$('main ul li')).toHaveLength(1);

      await expect(await page.$('[data-full-path="/"]')).toBeTruthy();

      await page.click('[data-full-path="/"]');

      await page.waitForTimeout(200);

      await expect(await page.$$('main ul li')).toHaveLength(24);

      await page.click('[data-full-path="/new-directory/"] .rename');

      await page.waitForFunction(() =>
        document.activeElement.matches(
          '[data-full-path="/new-directory/"] input[type="text"]'
        )
      );

      await page.keyboard.down('Control');
      await page.keyboard.press('Backspace');
      await page.keyboard.up('Control');

      await page.type(
        '[data-full-path="/new-directory/"] input[type="text"]',
        'folder'
      );

      await page.keyboard.press('Enter');

      await expectToastShown(
        page,
        `'new-directory' successfully renamed to 'new-folder'.`,
        'success'
      );

      await isElementThere(page, '[data-full-path="/new-folder/"]');

      page.once('dialog', async (dialog) => await dialog.accept());

      await page.click('[data-full-path="/new-folder/"] .delete');

      await isElementGone(page, '[data-full-path="/new-folder/"]');

      await expectToastShown(page, `'new-folder' has been deleted.`, 'success');
    });

    it('should show expected errors', async () => {
      await isPageReady(page, BASE_URL);

      await page.click('[data-full-path="/inaccessible-dir/"]');

      await expectToastShown(
        page,
        'HEAD /inaccessible-dir/ failed: Forbidden (403)',
        'error'
      );

      await page.click('[data-full-path="/inaccessible-file"]');

      await expectToastShown(
        page,
        'GET /inaccessible-file failed: Forbidden (403)',
        'error'
      );

      await page.click('[data-full-path="/inaccessible-image.jpg"]');

      await expectToastShown(
        page,
        'HEAD /inaccessible-image.jpg failed: Forbidden (403)',
        'error'
      );

      await page.click('[data-full-path="/inaccessible-text-file.txt"]');

      await expectToastShown(
        page,
        'GET /inaccessible-text-file.txt failed: Forbidden (403)',
        'error'
      );
    });

    it('should be possible to download a file', async () => {
      await isPageReady(page, BASE_URL);

      await expect(() => fs.accessSync(DESTINATION_FONT_FILE)).toThrow();

      await page
        .target()
        .createCDPSession()
        .then((client) =>
          client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: '/tmp',
          })
        );

      await page.click(
        '[data-full-path="/BlackAndWhitePicture-Regular.ttf"] [download]'
      );

      // wait for the file to download
      await page.waitForTimeout(400);

      await expect(() => fs.accessSync(DESTINATION_FONT_FILE)).not.toThrow();

      fs.rmSync(DESTINATION_FONT_FILE);
    });

    it('should be possible to upload a file', async () => {
      await isPageReady(page, BASE_URL);

      const elementHandle = (await page.$(
        'input[type=file]'
      )) as ElementHandle<HTMLInputElement>;

      await elementHandle.uploadFile('./package.json');

      await expectToastShown(
        page,
        `'package.json' has been successfully uploaded.`,
        'success'
      );

      await page.click('[data-full-path="/package.json"]');

      await page.once('dialog', async (dialog) => await dialog.accept());

      await page.click('[data-full-path="/package.json"] .delete');

      await isElementGone(page, '[data-full-path="/package.json"]');

      await expectToastShown(
        page,
        `'package.json' has been deleted.`,
        'success'
      );
    });
  });

  beforeAll(async () => {
    try {
      fs.accessSync(DESTINATION_FONT_FILE);
      fs.rmSync(DESTINATION_FONT_FILE);
    } catch (e) {
      // we don't need to do anything here
    }
  });
});
