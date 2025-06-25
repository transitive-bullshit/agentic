import {
  type DefaultError,
  type InfiniteData,
  QueryClient,
  type QueryKey,
  useInfiniteQuery as useInfiniteQueryBase,
  useQuery as useQueryBase
} from '@tanstack/react-query'
import { HTTPError } from 'ky'

export const queryClient = new QueryClient()

const retryStatusCodes = new Set([408, 413, 429, 500, 502, 503, 504])

// Inspired by https://github.com/sindresorhus/ky#retry
function retry(failureCount: number, error: any): boolean {
  if (error instanceof HTTPError) {
    const { status } = error.response
    if (!retryStatusCodes.has(status)) {
      return false
    }
  }

  return failureCount < 3
}

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  opts: Parameters<
    typeof useQueryBase<TQueryFnData, TError, TData, TQueryKey>
  >[0]
): ReturnType<typeof useQueryBase<TQueryFnData, TError, TData, TQueryKey>> {
  return useQueryBase<TQueryFnData, TError, TData, TQueryKey>({
    retry,
    ...opts
  })
}

export function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  opts: Parameters<
    typeof useInfiniteQueryBase<
      TQueryFnData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >
  >[0]
): ReturnType<
  typeof useInfiniteQueryBase<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >
> {
  return useInfiniteQueryBase<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >({
    retry,
    ...opts
  })
}
