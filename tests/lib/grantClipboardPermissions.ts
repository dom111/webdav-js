import { Page } from 'puppeteer';

export const grantRawPermissions = async (
  page: Page,
  permissions: string[]
) => {
  const context = await page.browserContext(),
    url = new URL(page.url());

  // @ts-ignore
  await context._connection.send('Browser.grantPermissions', {
    origin: url.origin,
    // @ts-ignore
    browserContextId: context._id,
    permissions: permissions,
  });

  await page.reload();
};

// https://github.com/puppeteer/puppeteer/issues/3241#issuecomment-751489962:
// > When I try to grant clipboard-write permissions in headless mode it changes it to 'denied' instead (if I don't call it is it 'prompt'):
// >
// >   context.overridePermissions(url.origin, ['clipboard-write'])
// >
// >   const page = await context.newPage()
// >   await page.goto(url.origin)
// >   const state = await page.evaluate(async () => {
// >     return (await navigator.permissions.query({name: 'clipboard-write'})).state;
// >   });
// >   console.log(state) // denied
// >
// > macOS: 10.15.7
// > puppeteer: 5.4.1
//
// I'm not an expert in this regard, but at least when limiting the scope of this discussion to clipboard-write and clipboard-read, it seems to me that there is a bug/mistake in the overridePermissions() method. As per its documentation:
//
// > An array of permissions to grant. All permissions that are not listed here will be automatically denied.
//
// So, if you specify either clipboard-write and clipboard-read as permissions then both will be mapped to clipboardReadWrite which is the only permission that will be granted. By looking at the Chrome DevTools Protocol (which overridePermissions() uses to override permissions) I found that there are actually two permissions related to the clipboard: clipboardSanitizedWrite and clipboardReadWrite. When I mimicked overridePermissions()'s CDP call manually using 'clipboardSanitizedWrite' as permissions I was able to use navigator.clipboard.writeText and your snipped returned "granted" (instead of "denied"). More specifically, the following snippet should work:
//
//   await context._connection.send('Browser.grantPermissions', {
//     origin: url.origin,
//     browserContextId: this._id || undefined,
//     permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
//   });
//
//   const page = await context.newPage()
//   await page.goto(url.origin)
//   const state = await page.evaluate(async () => {
//     return (await navigator.permissions.query({name: 'clipboard-write'})).state;
//   });
//   console.log(state) // granted
//
// It's not pretty and should probably be fixed in overridePermissions(), but it gets the job done.
export const grantClipboardPermissions = (page: Page) =>
  grantRawPermissions(page, ['clipboardReadWrite', 'clipboardSanitizedWrite']);
