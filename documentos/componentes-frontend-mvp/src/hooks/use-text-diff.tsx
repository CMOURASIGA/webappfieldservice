type TextDiffResult = {
  hasChanges: boolean;
};

export function useTextDiff(original: string, edited: string): TextDiffResult {
  if (!original || !edited) return { hasChanges: false };

  const words1 = original.trim().split(/\s+/);
  const words2 = edited.trim().split(/\s+/);

  const maxLength = Math.max(words1.length, words2.length);

  for (let i = 0; i < maxLength; i++) {
    const word1 = words1[i];
    const word2 = words2[i];

    if (word1 !== word2) {
      return { hasChanges: true };
    }
  }

  return { hasChanges: false };
}
