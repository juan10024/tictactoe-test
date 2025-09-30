/*
 * file: useApi.ts
 * hook: useApi
 * description:
 *     Custom React hook to handle API data fetching with validation.
 *     - Handles loading, error, and data states
 *     - Supports manual re-fetching via `refetch`
 *     - Validates responses against a provided Zod schema
 */

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

const API_BASE_URL = 'http://localhost:8080/api';

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useApi
 * @param endpoint - API endpoint to fetch from
 * @param schema - Zod schema for validating the response
 * @returns { data, isLoading, error, refetch }
 */
export function useApi<T>(
  endpoint: string,
  schema: z.ZodType<T>
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
          throw new Error(
            `API Error: ${response.statusText} (Status: ${response.status})`
          );
        }

        const jsonData = await response.json();

        // Validate data against schema
        const parsedData = schema.parse(jsonData);
        setData(parsedData);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error('Zod validation error:', err.issues);
          setError('Invalid data structure received from server.');
        } else if (err instanceof Error) {
          console.error(`Fetch error for endpoint "${endpoint}":`, err.message);
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, schema, trigger]);

  return { data, isLoading, error, refetch };
}
