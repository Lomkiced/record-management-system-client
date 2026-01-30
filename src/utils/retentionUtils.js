/**
 * Retention Period Utilities
 * Centralizes logic for formatting, parsing, and normalizing retention periods.
 */

/**
 * Normalizes a retention period value and unit.
 * Example: 4 Weeks -> 1 Month, 1 Years -> 1 Year
 * @param {number|string} value - The numeric value (e.g., 4)
 * @param {string} unit - The unit (e.g., "Weeks")
 * @returns {string} - Formatted string (e.g., "1 Month")
 */
export const formatRetention = (value, unit) => {
    if (unit === 'Permanent') return 'Permanent';
    if (!value) return '';

    let num = parseInt(value, 10);
    let u = unit.toLowerCase(); // normalize to lowercase first: 'weeks', 'years'

    if (isNaN(num)) return '';

    // 1. Logic Conversions (User Request: 4 Weeks -> 1 Month)
    if (u.includes('week') && num > 0 && num % 4 === 0) {
        num = num / 4;
        u = 'month';
    }

    // Optional: 12 Months -> 1 Year
    if (u.includes('month') && num > 0 && num % 12 === 0) {
        num = num / 12;
        u = 'year';
    }

    // 2. Singular/Plural Formatting
    // Ensure base unit is singular
    if (u.endsWith('s')) u = u.slice(0, -1);

    // Initial Capitalization
    u = u.charAt(0).toUpperCase() + u.slice(1);

    // Add 's' if plural
    if (num !== 1) u += 's';

    return `${num} ${u}`;
};

/**
 * Parses a retention string into value and unit.
 * @param {string} periodString - e.g., "5 Years"
 * @returns {object} - { value: 5, unit: "Years", isPermanent: false }
 */
export const parseRetention = (periodString) => {
    if (!periodString || periodString === 'Permanent') {
        return { value: '', unit: 'Permanent', isPermanent: true };
    }

    const parts = periodString.split(' ');
    const value = parseInt(parts[0], 10);
    const unit = parts.length > 1 ? parts[1] : '';

    return { value, unit, isPermanent: false };
};

/**
 * Helper specifically for display to avoid redundancy like "2 months months"
 * @param {string} periodString 
 * @returns {string} Clean formatted string
 */
export const displayRetention = (periodString) => {
    if (!periodString) return '';
    const { value, unit, isPermanent } = parseRetention(periodString);
    if (isPermanent) return 'Permanent';
    // Re-run format to fix any legacy bad data (e.g., "1 Years" stored in DB)
    return formatRetention(value, unit);
};
