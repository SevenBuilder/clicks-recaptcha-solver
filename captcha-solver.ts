import { Solver } from '@2captcha/captcha-solver';
import { Page } from 'playwright-core';
import { initCaptchaParamsExtractor } from './utils/initCaptchaParamsExtractor';
import { getCaptchaParams } from './utils/getCaptchaParams';
import { clickRecaptchaVerifyButton } from './utils/clickRecaptchaVerifyButton';
import { clickAtCoordinates } from './utils/clickAtCoordinates';
import { isRecaptchaPassed } from './utils/isRecaptchaPassed';
import { isFoundRecaptchaChallengeFrame } from './utils/isFoundRecaptchaChallengeFrame';
import { isFoundReCaptchaBadge } from './utils/isFoundReCaptchaBadge';

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

// The basic logic of the captcha solution
export const captchaSolver = async function (page: Page, apikey: string) {
    const solver = new Solver(apikey, 500);
    const recaptchaBadgeIframeSelector = 'iframe[title="reCAPTCHA"]';
    const recaptchaCheckboxSelector = 'span.recaptcha-checkbox-unchecked';

    await page.waitForSelector(recaptchaBadgeIframeSelector, { timeout: 30000 });
    await sleep(5000);

    // Search for reCAPTCHA Badge on the page
    const isFoundReCaptcha = await isFoundReCaptchaBadge(page);

    // Checking whether the recaptcha is found on the page, if not, then we generate an error message
    if (isFoundReCaptcha) {
        console.log(`reCAPTCHA Badge is found.`);
    } else {
        throw new Error('reCAPTCHA Badge not found!');
    }

    // Getting a recaptcha badge iframe
    const iframeElementHandle = await page.$(recaptchaBadgeIframeSelector);
    if (!iframeElementHandle) {
        throw new Error('reCAPTCHA Badge iframe not found!');
    }
    const recaptchaBadgeIframe = await iframeElementHandle.contentFrame();

    if (recaptchaBadgeIframe) {
        // Click on checkbox reCAPTCHA
        await recaptchaBadgeIframe.evaluate((recaptchaCheckboxSelector) => {
            const recaptchaCheckbox = document.querySelector(recaptchaCheckboxSelector);
            if (recaptchaCheckbox) {
                (recaptchaCheckbox as HTMLElement).click();
            } else {
                throw new Error('reCAPTCHA checkbox not found!');
            }
        }, recaptchaCheckboxSelector);

        await sleep(5000);

        // We check for the presence of a frame with a captcha task
        const isRecaptchaChallengeShow = await isFoundRecaptchaChallengeFrame(page);

        // Set the value to `true` for visualization of clicks
        const highlightClicks = false;

        if (isRecaptchaChallengeShow) {
            const frameHandle = await page.waitForSelector(
                'iframe[src*="https://www.google.com/recaptcha/api2/bframe"]'
            );
            let frame = await frameHandle.contentFrame();

            // Initialize the captcha parameter extraction function in the frame
            await initCaptchaParamsExtractor(frame);

            let isCaptchaNotSolved = true;

            // The captcha solution cycle
            while (isCaptchaNotSolved) {
                const captchaParams = await getCaptchaParams(frame);

                console.log(
                    `Successfully fetched captcha parameters. recaptcha size is ${captchaParams.columns}*${captchaParams.rows}`
                );

                // Getting a captcha solution
                const answer = await solver.grid({
                    body: captchaParams.body,
                    textinstructions: captchaParams.comment,
                    cols: captchaParams.columns,
                    rows: captchaParams.rows,
                    canSkip: 1,
                    imgType: 'recaptcha', // TODO: add param to lib,
                    recaptcha: 1
                });

                const isCapthcaSolved = answer.data;
                if (isCapthcaSolved) {
                    console.log(`The answer for captcha ${answer.id} was received successfully`);
                    console.log(answer);
                    if (answer.data === 'No_matching_images') {
                        // 'No_matching_images' - The captcha image does not contain images that meet the requirements. This means that the captcha has been solved.
                        await sleep(1213);
                        await clickRecaptchaVerifyButton(page);
                    }
                } else {
                    // TODO:  when you get "ERROR_CAPTCHA_UNSOLVABLE" you can try to solve captcha again
                    return false;
                }

                // Parse the answer
                let clicks: number[] = answer.data
                    .replace('click:', '')
                    .split('/')
                    .map((el) => Number(el)); // removing the "click:" line from the response and converting to number

                console.log('Clicks:', clicks);

                const captchaSize = captchaParams.columns;

                // Making clicks
                let timeToSleep = 100; // ms
                clicks.forEach(async (el, id) => {
                    await sleep(timeToSleep * id); // delay (number of seconds of delay for each click)
                    await clickAtCoordinates(page, captchaSize, el, highlightClicks);
                });

                await sleep(timeToSleep * (clicks.length + 1) + 2202);
                await clickRecaptchaVerifyButton(page, highlightClicks);

                await sleep(3000);
                const isCaptchaSolved = await isRecaptchaPassed(page);
                isCaptchaNotSolved = !isCaptchaSolved;
            }

            return true;
        }
    }
};
