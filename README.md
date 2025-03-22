# Clicks reCAPTCHA Solver

A powerful automation tool for solving Google reCAPTCHA challenges using Playwright and Puppeteer. This package intelligently detects and simulates human-like interactions, including mouse movements and precise clicks, to bypass reCAPTCHA v2 and other similar challenges. Ideal for automation workflows, web scraping, and bot-driven tasks.

## Installation

```sh
npm install clicks-recaptcha-solver
```

## Usage Example

```javascript
const { solveRecaptcha } = require('clicks-recaptcha-solver');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.google.com/recaptcha/api2/demo');

    await solveRecaptcha(page, TwoCaptchaAPIKey);

    console.log('reCAPTCHA solved!');

    await browser.close();
})();
```

## API

### `solveRecaptcha(page: Page): Promise<void>`

-   **page**: An instance of a Playwright or Puppeteer page.
-   **Returns**: A `Promise` that resolves when the reCAPTCHA is successfully solved.

## License

**ISC**

## Links

-   [GitHub Repository](https://github.com/SevenBuilder/clicks-recaptcha-solver)
-   [Issue Tracker](https://github.com/SevenBuilder/clicks-recaptcha-solver/issues)
