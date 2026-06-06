import { useState, useMemo } from 'react';

/**
 * useSearch — generic search hook
 *
 * @param {Array}  items  - the full list to filter
 * @param {Array}  keys   - array of object keys to search across
 *                          If empty, searches all string-able values.
 * @returns {{ term, setTerm, filtered }}
 */
export function useSearch(items, keys = []) {
  const [term, setTerm] = useState('');

  const filtered = useMemo(() => {
    if (!term.trim()) return items;
    const lower = term.toLowerCase();
    return items.filter(item => {
      const fields = keys.length > 0
        ? keys.map(k => item[k])
        : Object.values(item);
      return fields.some(v => v != null && String(v).toLowerCase().includes(lower));
    });
  }, [items, term, keys]);

  return { term, setTerm, filtered };
}
