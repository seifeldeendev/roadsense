import { useState } from 'react';

// `value`, or while it is null the last non-null value seen (null before the
// first), so a list being replaced keeps showing until its replacement arrives.
export function useLatest<T>(value: T | null): T | null {
  const [last, setLast] = useState<T | null>(value);
  // Adjusting state while rendering, as React documents for derived state.
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}
