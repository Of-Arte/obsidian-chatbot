/**
 * To enable developer mode and bypass the rate limit, run the following
 * in your browser's developer console:
 *
 * localStorage.setItem('obsidian_dev_mode', 'true');
 *
 * To disable it:
 *
 * localStorage.removeItem('obsidian_dev_mode');
 */

const RATE_LIMIT_KEY = 'obsidian_message_timestamps';
const DEV_MODE_KEY = 'obsidian_dev_mode';
const MAX_MESSAGES = 15; // Max messages allowed
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

const isDevMode = (): boolean => {
    try {
        return localStorage.getItem(DEV_MODE_KEY) === 'true';
    } catch {
        // In case localStorage is disabled or inaccessible
        return false;
    }
};

const getTimestamps = (): number[] => {
    try {
        const data = localStorage.getItem(RATE_LIMIT_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveTimestamps = (timestamps: number[]): void => {
    try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
    } catch (error) {
        console.error("Failed to save timestamps for rate limiting", error);
    }
};

/**
 * Checks if the user is currently rate-limited.
 * @returns An object with `isLimited` and `retryAfter` (in seconds).
 */
export const checkRateLimit = (): { isLimited: boolean; retryAfter: number } => {
    if (isDevMode()) {
        console.log("Developer mode is active. Skipping rate limit check.");
        return { isLimited: false, retryAfter: 0 };
    }

    const now = Date.now();
    const timestamps = getTimestamps();

    // Filter out timestamps that are older than the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < TIME_WINDOW_MS);
    
    if (recentTimestamps.length >= MAX_MESSAGES) {
        // User has reached the limit
        const oldestTimestamp = recentTimestamps[0];
        const retryAfterMs = TIME_WINDOW_MS - (now - oldestTimestamp);
        return { isLimited: true, retryAfter: Math.ceil(retryAfterMs / 1000) };
    }
    
    // Clean up old timestamps from storage if they haven't been filtered yet
    if (recentTimestamps.length !== timestamps.length) {
        saveTimestamps(recentTimestamps);
    }
    
    return { isLimited: false, retryAfter: 0 };
};

/**
 * Records a new message timestamp for the user.
 */
export const recordMessage = (): void => {
    if (isDevMode()) {
        return;
    }
    
    const now = Date.now();
    const timestamps = getTimestamps();
    
    // Add the new timestamp. We only need to store up to MAX_MESSAGES.
    const updatedTimestamps = [...timestamps, now].slice(-MAX_MESSAGES);
    
    saveTimestamps(updatedTimestamps);
};
