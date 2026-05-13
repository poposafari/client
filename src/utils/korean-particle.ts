function hasJongseong(word: string): boolean {
  if (!word) return false;
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0;
  }

  if (last >= '0' && last <= '9') {
    return '13678'.includes(last);
  }

  return false;
}

export const particleFormatters: Record<string, (value: string) => string> = {
  '을/를': (v) => v + (hasJongseong(v) ? '을' : '를'),
  '은/는': (v) => v + (hasJongseong(v) ? '은' : '는'),
  '이/가': (v) => v + (hasJongseong(v) ? '이' : '가'),
  '와/과': (v) => v + (hasJongseong(v) ? '과' : '와'),
  '(으)로': (v) => v + (hasJongseong(v) ? '으로' : '로'),
};
