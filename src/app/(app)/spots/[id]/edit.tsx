import { useLocalSearchParams } from 'expo-router';

import { ErrorState, LoadingState } from '@/components/ui';
import { useLogbook } from '@/features/logbook/api';
import { SpotForm } from '@/features/spots/SpotForm';

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const logbook = useLogbook();
  if (logbook.isLoading) return <LoadingState />;
  const spot = logbook.data?.spots.find((s) => s.id === id);
  if (!spot) return <ErrorState onRetry={() => void logbook.refetch()} />;
  return <SpotForm spot={spot} />;
}
