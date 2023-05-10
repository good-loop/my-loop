module.exports = {
    testDir: "./tests",
    reporter: [['html', {outputFolder: 'playwright-report'}]],
    retries: 1,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
  };
  