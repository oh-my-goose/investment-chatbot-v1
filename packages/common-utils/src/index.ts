export function getApiKeySafely(): string | never {
  const KEY = process.env.OPENAI_API_KEY
  if (!KEY) {
    throw new Error(`Set OPENAI_API_KEY first.`);
  }
  return KEY
}
