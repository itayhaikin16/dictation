/**
 * Removes Hebrew niqqud (vowels/diacritics) from a string for easier comparison.
 * This follows the Unicode range for Hebrew niqqud: U+05B0 to U+05C7.
 */
export function normalizeHebrew(text: string): string {
  if (!text) return '';
  
  // Remove niqqud and vowel marks
  // Hebrew niqqud range is \u05B0-\u05C7
  const niqqudRegex = /[\u05B0-\u05C7]/g;
  
  return text
    .replace(niqqudRegex, '')
    .trim();
}

/**
 * Validates if the user's input matches the target word.
 * @param input User typed input
 * @param target The correct word
 * @param strict If true, niqqud must match exactly.
 */
export function validateWord(input: string, target: string, strict: boolean = false): boolean {
  const cleanedInput = input.trim();
  const cleanedTarget = target.trim();

  if (strict) {
    return cleanedInput === cleanedTarget;
  }

  return normalizeHebrew(cleanedInput) === normalizeHebrew(cleanedTarget);
}
