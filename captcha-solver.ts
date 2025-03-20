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

export const captchaSolver = async function (page: Page, APIkey: string) {
    const solver = new Solver(APIkey, 500);
    const recaptchaBadgeIframeSelector = 'iframe[title="reCAPTCHA"]';
    const recaptchaCheckboxSelector = 'span.recaptcha-checkbox-unchecked';

    await page.waitForSelector(recaptchaBadgeIframeSelector, { timeout: 30000 });
    await sleep(5000);

    if (!(await isFoundReCaptchaBadge(page))) {
        throw new Error('reCAPTCHA Badge not found!');
    }

    const iframeElementHandle = await page.$(recaptchaBadgeIframeSelector);
    if (!iframeElementHandle) {
        throw new Error('reCAPTCHA Badge iframe not found!');
    }
    const recaptchaBadgeIframe = await iframeElementHandle.contentFrame();

    if (recaptchaBadgeIframe) {
        await recaptchaBadgeIframe.evaluate((recaptchaCheckboxSelector) => {
            const recaptchaCheckbox = document.querySelector(recaptchaCheckboxSelector);
            if (recaptchaCheckbox) {
                (recaptchaCheckbox as HTMLElement).click();
            } else {
                throw new Error('reCAPTCHA checkbox not found!');
            }
        }, recaptchaCheckboxSelector);

        await sleep(5000);

        if (await isFoundRecaptchaChallengeFrame(page)) {
            const frameHandle = await page.waitForSelector(
                'iframe[src*="https://www.google.com/recaptcha/api2/bframe"]'
            );
            const frame = await frameHandle.contentFrame();
            await initCaptchaParamsExtractor(frame);

            let isCaptchaNotSolved = true;
            const highlightClicks = false;

            while (isCaptchaNotSolved) {
                const captchaParams = await getCaptchaParams(frame);
                const answer = await solver.grid({
                    body: captchaParams.body,
                    textinstructions: captchaParams.comment,
                    cols: captchaParams.columns,
                    rows: captchaParams.rows,
                    canSkip: 1,
                    imgType: 'recaptcha',
                    recaptcha: 1
                });

                if (answer.data) {
                    if (answer.data === 'No_matching_images') {
                        await sleep(1213);
                        await clickRecaptchaVerifyButton(page);
                    }
                } else {
                    return false;
                }

                const clicks = answer.data
                    .replace('click:', '')
                    .split('/')
                    .map((el) => Number(el));

                const captchaSize = captchaParams.columns;
                const timeToSleep = 100;

                for (const [index, el] of clicks.entries()) {
                    await sleep(timeToSleep * index);
                    await clickAtCoordinates(page, captchaSize, el, highlightClicks);
                }

                await sleep(timeToSleep * (clicks.length + 1) + 2202);
                await clickRecaptchaVerifyButton(page, highlightClicks);

                await sleep(3000);
                isCaptchaNotSolved = !(await isRecaptchaPassed(page));
            }
            return true;
        }
    }
    return false;
};
