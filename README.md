# 🛠️ Clicks reCAPTCHA Solver

A powerful automation tool designed to solve Google reCAPTCHA challenges effortlessly using Playwright and Puppeteer. This package simulates human-like interactions, including mouse movements and precise clicks, to bypass reCAPTCHA v2 and similar challenges. Ideal for automation workflows, web scraping, and bot-driven tasks.

---

## 🚀 Features

✅ Fully automated Google reCAPTCHA v2 solver  
✅ Works with Playwright & Puppeteer  
✅ Simulates realistic human interactions  
✅ Lightweight and easy to integrate  
✅ Perfect for web scraping and automation

---

## 📥 Installation

Install the package using npm:

```sh
npm install clicks-recaptcha-solver
```

---

## 📌 Usage Example

Using Playwright to solve a reCAPTCHA:

```javascript
const { captchaSolver } = require('clicks-recaptcha-solver');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.google.com/recaptcha/api2/demo');

    await captchaSolver(page, TwoCaptchaApiKey);

    console.log('✅ reCAPTCHA solved successfully!');

    await browser.close();
})();
```

---

## 📚 API Reference

### `solveRecaptcha(page: Page): Promise<void>`

-   **page**: An instance of a Playwright or Puppeteer page.
-   **Returns**: A `Promise` that resolves when the reCAPTCHA is successfully solved.

---

## 🏷️ Keywords

To improve discoverability, add the following keywords in your `package.json`:

```json
"keywords": [
    "recaptcha",
    "recaptcha-solver",
    "captcha-bypass",
    "puppeteer-recaptcha",
    "playwright-captcha",
    "automation",
    "web scraping"
]
```

---

## 📜 License

This project is licensed under the **ISC License**.

---

## 🔗 Useful Links

-   📂 [GitHub Repository](https://github.com/SevenBuilder/clicks-recaptcha-solver)
-   🐞 [Issue Tracker](https://github.com/SevenBuilder/clicks-recaptcha-solver/issues)

---

🚀 **Speed up your automation with Clicks reCAPTCHA Solver!**
