export function getApiKeySafely(): string | never {
    return getValueSafely('OPENAI_API_KEY');
}

export function getSrpApiKeySafely(): string | never {
    return getValueSafely('SERPAPI_API_KEY');
}

/**
 * Get key` from env variable.
 * Fail if it's not resolvable.
 */
function getValueSafely(key: string): string | never {
    const KEY = process.env[key];
    if (!KEY) {
        throw new Error(`Set ${key} first.`);
    }
    return KEY;
}
