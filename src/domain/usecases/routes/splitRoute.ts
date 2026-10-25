// Splits a route at the driver's progress into the part already driven and the
// part ahead; they share the split point so the two lines join. An unknown
// progress (undefined or below 0, e.g. before the first GPS fix) or one past the
// end leaves the whole route ahead rather than dropping it.
export function splitRoute<T>(points: readonly T[], progressIndex: number | undefined): { travelled: T[]; ahead: T[] } {
  if (progressIndex === undefined || progressIndex < 0 || points.length === 0) {
    return { travelled: [], ahead: [...points] };
  }
  const index = Math.min(progressIndex, points.length - 1);
  return { travelled: points.slice(0, index + 1), ahead: points.slice(index) };
}
