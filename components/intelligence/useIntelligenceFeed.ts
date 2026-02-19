"use client";

import { useCallback, useEffect, useState } from "react";

type FeedResponse<T> = {
  ok: boolean;
  items: T[];
  count: number;
  generatedAt: string;
};

export function useIntelligenceFeed<T>(
  endpoint: string,
  query: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetch(`${endpoint}${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await result.json()) as FeedResponse<T> & { error?: string };
      if (!result.ok || !payload.ok) {
        setError(payload.error || "Unable to load intelligence feed.");
        return;
      }
      setItems(payload.items || []);
      setCount(payload.count || 0);
      setGeneratedAt(payload.generatedAt || "");
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load intelligence feed.",
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, count, generatedAt, loading, error, reload: load };
}
