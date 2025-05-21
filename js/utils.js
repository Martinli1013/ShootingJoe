// Utility functions

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum possible value.
 * @param {number} max - The maximum possible value.
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum possible value.
 * @param {number} max - The maximum possible value.
 * @returns {number} A random float.
 */
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Simple AABB (Axis-Aligned Bounding Box) collision detection.
 * Assumes objects have x, y, width, height properties.
 * @param {object} rect1 - The first rectangle.
 * @param {object} rect2 - The second rectangle.
 * @returns {boolean} True if the rectangles collide, false otherwise.
 */
function checkCollision(rect1, rect2) {
    if (!rect1 || !rect2) return false; // Ensure objects exist
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Clamp a value between a minimum and maximum.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Add more utility functions as needed, for example:
// - Vector math (if movement/physics become more complex)
// - Angle calculations
// - Debug drawing functions 