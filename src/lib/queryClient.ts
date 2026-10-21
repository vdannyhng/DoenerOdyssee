import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    // Offline nicht endlos „laden“, sondern sofort mit Netzwerkfehler antworten
    mutations: { networkMode: 'always' },
  },
});
