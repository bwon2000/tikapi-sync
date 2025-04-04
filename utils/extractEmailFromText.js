/**
 * Extracts the first email found in a block of text.
 * @param {string} text - The bio or signature field from TikAPI
 * @returns {string|null} - The found email or null
 */
export function extractEmailFromText(text = '') {
  if (!text || typeof text !== 'string') return null;

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);

  return match ? match[0] : null;
}
