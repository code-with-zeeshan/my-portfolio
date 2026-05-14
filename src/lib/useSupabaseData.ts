// src/lib/useSupabaseData.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

interface UseSupabaseDataOptions<T> {
  /** Table name to query */
  table: string;
  /** Columns to select (default: "*") */
  select?: string;
  /** Optional filter clause, e.g. { column: "published", value: true } */
  filter?: { column: string; value: unknown };
  /** Order clause */
  order?: { column: string; ascending?: boolean };
  /** Limit */
  limit?: number;
  /** Single row query (returns single object instead of array) */
  single?: boolean;
  /** Static fallback data to use when Supabase is unreachable */
  fallback?: T[] | null;
  /** Transform function to map raw data to desired shape */
  transform?: (data: any) => T;
}

interface UseSupabaseDataResult<T> {
  data: T[] | null;
  loading: boolean;
  supabaseDown: boolean;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from Supabase with static fallback.
 * Eliminates duplicated try/catch/finally + supabaseDown + loading patterns
 * across all dynamic sections.
 */
export function useSupabaseData<T>({
  table,
  select = "*",
  filter,
  order,
  limit,
  single = false,
  fallback = null,
  transform,
}: UseSupabaseDataOptions<T>): UseSupabaseDataResult<T> {
  const [data, setData] = useState<T[] | null>(fallback);
  const [loading, setLoading] = useState(true);
  const [supabaseDown, setSupabaseDown] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      let query = supabase.from(table).select(select);

      if (filter) {
        query = query.eq(filter.column, filter.value);
      }
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }
      if (limit) {
        query = query.limit(limit);
      }
      if (single) {
        query = query.single() as any;
      }

      const { data: result, error } = await query;

      if (error) {
        console.warn(`Supabase error fetching ${table}:`, error.message);
        setSupabaseDown(true);
        return;
      }

      let transformed: T[] | null = (result as T[] | null) ?? null;
      if (transform && result) {
        transformed = Array.isArray(result)
          ? (result as any[]).map((item: any) => transform(item))
          : [transform(result)];
      }

      setData(transformed);
      setSupabaseDown(false);
    } catch {
      // Network error — Supabase unreachable
      setSupabaseDown(true);
    } finally {
      setLoading(false);
    }
  }, [table, select, filter, order, limit, single, transform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, supabaseDown, refetch };
}