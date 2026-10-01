'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseFilters } from '@/lib/filters';
import { usePrefs } from '@/providers/PrefsProvider';

// Filters live in the URL (shareable, back/forward works). Resolution order for each filter:
//   explicit ?param  →  what the user last chose this session  →  page default  →  saved default.
export function useFilters(pageDefaults = {}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { baseFilters, sessionFilters, touched, remember } = usePrefs();

  const defaults = useMemo(() => {
    const base = { ...baseFilters };
    for (const [k, v] of Object.entries(pageDefaults)) if (!touched[k]) base[k] = v;
    return { ...base, ...sessionFilters };
  }, [baseFilters, sessionFilters, touched, pageDefaults]);

  const filters = useMemo(() => parseFilters(k => sp.get(k), defaults), [sp, defaults]);

  const set = useCallback(patch => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) next.set(k, v);
    remember(patch);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [sp, pathname, router, remember]);

  const qs = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  return { filters, set, qs };
}
