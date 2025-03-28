/**
 * Returns a random integer within the specified inclusive range.
 *
 * @param {number} min - Minimum possible value.
 * @param {number} max - Maximum possible value.
 * @returns {number} A random number between `min` and `max` inclusive.
 *
 * @example
 * const randomNum = getRandomNumber(1, 10);
 * console.log(randomNum); // For example: 5
 */
export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
