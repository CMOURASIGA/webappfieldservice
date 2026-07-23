/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryString() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const addQueryString = (key: string, value: string | null) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    value ? urlParams.set(key, value) : urlParams.delete(key);

    const newUrl = `${pathname}?${urlParams.toString()}`;
    router.push(newUrl);
  };

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const urlParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    const newUrl = `${pathname}?${urlParams.toString()}`;
    router.push(newUrl);
  };

  const getAllQueryStrings = () => {
    if (typeof window === "undefined") return {}; // Evita erro no SSR

    const urlParams = new URLSearchParams(searchParams.toString());
    const queryStrings: any = {};

    for (const [key, value] of urlParams.entries()) {
      queryStrings[key] = value;
    }

    return queryStrings;
  };

  return { addQueryString, getAllQueryStrings, updateQueryParams };
}
