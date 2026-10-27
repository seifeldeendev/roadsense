import { useEffect, useRef, useState } from 'react';

// The result of an async lookup for `key`, run again whenever the key changes
// (compared by identity). `value` is null while the lookup for the current key
// is running, or when the key is null; a result for an older key is never shown.
// `load` must not reject: callers turn a failure into a value.
export function useAsyncResult<K, T>(key: K | null, load: (key: K) => Promise<T>): { value: T | null; pending: boolean } {
  const [result, setResult] = useState<{ key: K; value: T } | null>(null);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    void loadRef.current(key).then((value) => {
      if (!cancelled) setResult({ key, value });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = key !== null && result !== null && result.key === key;
  return { value: current ? result.value : null, pending: key !== null && !current };
}
