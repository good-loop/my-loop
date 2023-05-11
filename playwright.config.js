module.exports = {
    testDir: "./tests",
    reporter: [['html', {
        outputFolder: process.env.PLAYWRIGHT_REPORT_DIRECTORY || 'playwright-report',
        open: "never"
    }]],
    retries: 1,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
  };
  