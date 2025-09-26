// frontend/src/hooks/useApi.ts
/*
 * Reusable API Fetch Hook
 *
 * A custom hook to streamline data fetching from the backend API. It handles
 * loading, data, and error states, providing a clean and reusable pattern
 * for asynchronous operations across the application, especially for the
 * admin dashboard.
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

export function useApi<T>(
  endpoint: string,
  schema: z.ZodType<T>
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
        }
        const jsonData = await response.json();

        // Validate data against the Zod schema
        const parsedData = schema.parse(jsonData);
        setData(parsedData);

      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error('Zod validation error:', err.issues);
          setError('Received invalid data structure from server.');
        } else if (err instanceof Error) {
          console.error(`Fetch error for endpoint ${endpoint}:`, err.message);
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
