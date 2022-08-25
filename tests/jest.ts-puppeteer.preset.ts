const { jsWithTs } = require('ts-jest/presets');
const jestPuppeteerPreset = require('jest-puppeteer/jest-preset.js');

const combined = {
  ...jsWithTs,
  ...jestPuppeteerPreset,
};

module.exports = (product) => ({
  ...combined,
  launch: {
    ...(combined.launch ?? {}),
    product,
  },
});
