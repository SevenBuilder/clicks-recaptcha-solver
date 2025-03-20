import { CaptchaParams } from './getCaptchaParams';

/**
 * Initializes a custom function within the captcha iframe to extract parameters.
 *
 * This function injects a script that extracts the required parameters from the captcha page.
 * It creates a canvas to work with captcha images, extracts image tiles, and provides metadata like
 * rows, columns, and a base64-encoded image of the current captcha state.
 *
 * @async
 * @function initCaptchaParamsExtractor
 * @param {import('puppeteer').Frame} frame - A Puppeteer frame representing the reCAPTCHA iframe.
 * @returns {Promise<void>} This function doesn't return a value itself but adds a function (`getRecaptchaParams`)
 *                          into the frame context to extract captcha parameters.
 * @throws Will reject the promise if reCAPTCHA elements cannot be found on the page.
 */
export const initCaptchaParamsExtractor = async function (frame: any): Promise<void> {
    await frame.evaluate(() => {
        (window as any).getRecaptchaParams = (): Promise<CaptchaParams> => {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject('Failed to get canvas rendering context');
                    return;
                }

                const commentElement = document.querySelector('.rc-imageselect-desc-wrapper');
                const comment = commentElement
                    ? commentElement.textContent?.replaceAll('\n', ' ') || ''
                    : '';

                const img4x4 = document.querySelector<HTMLImageElement>('img.rc-image-tile-44');
                if (!img4x4) {
                    const table3x3 = document.querySelector(
                        'table.rc-imageselect-table-33 > tbody'
                    );
                    if (!table3x3) {
                        reject('Cannot find reCAPTCHA elements');
                        return;
                    }

                    const initial3x3img =
                        table3x3.querySelector<HTMLImageElement>('img.rc-image-tile-33');
                    if (!initial3x3img) {
                        reject('Cannot find initial 3x3 image');
                        return;
                    }

                    canvas.width = initial3x3img.naturalWidth;
                    canvas.height = initial3x3img.naturalHeight;
                    ctx.drawImage(initial3x3img, 0, 0);

                    const updatedTiles =
                        document.querySelectorAll<HTMLImageElement>('img.rc-image-tile-11');
                    if (updatedTiles.length > 0) {
                        const pos = [
                            { x: 0, y: 0 },
                            { x: ctx.canvas.width / 3, y: 0 },
                            { x: (ctx.canvas.width / 3) * 2, y: 0 },
                            { x: 0, y: ctx.canvas.height / 3 },
                            { x: ctx.canvas.width / 3, y: ctx.canvas.height / 3 },
                            { x: (ctx.canvas.width / 3) * 2, y: ctx.canvas.height / 3 },
                            { x: 0, y: (ctx.canvas.height / 3) * 2 },
                            { x: ctx.canvas.width / 3, y: (ctx.canvas.height / 3) * 2 },
                            { x: (ctx.canvas.width / 3) * 2, y: (ctx.canvas.height / 3) * 2 }
                        ];
                        updatedTiles.forEach((t) => {
                            const parentElement = t.parentElement?.parentElement
                                ?.parentElement as HTMLElement | null;
                            if (parentElement && parentElement.tabIndex >= 3) {
                                const ind = parentElement.tabIndex - 3;
                                if (ind >= 0 && ind < pos.length) {
                                    ctx.drawImage(t, pos[ind].x, pos[ind].y);
                                }
                            }
                        });
                    }

                    resolve({
                        rows: 3,
                        columns: 3,
                        type: 'GridTask',
                        comment,
                        body: canvas.toDataURL().replace(/^data:image\/?[A-z]*;base64,/, '')
                    });
                } else {
                    canvas.width = img4x4.naturalWidth;
                    canvas.height = img4x4.naturalHeight;
                    ctx.drawImage(img4x4, 0, 0);
                    resolve({
                        rows: 4,
                        columns: 4,
                        comment,
                        body: canvas.toDataURL().replace(/^data:image\/?[A-z]*;base64,/, ''),
                        type: 'GridTask'
                    });
                }
            });
        };
    });
};
