import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi(options: UseApiOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string, payload?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService[method](url, payload);
        setData(response.data);
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const get = useCallback((url: string) => execute('get', url), [execute]);
  const post = useCallback((url: string, data?: any) => execute('post', url, data), [execute]);
  const put = useCallback((url: string, data?: any) => execute('put', url, data), [execute]);
  const del = useCallback((url: string) => execute('delete', url), [execute]);
  const patch = useCallback((url: string, data?: any) => execute('patch', url, data), [execute]);

  return {
    data,
    loading,
    error,
    execute,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}
