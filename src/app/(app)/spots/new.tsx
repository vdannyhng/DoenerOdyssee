import { router, useLocalSearchParams } from 'expo-router';

import { useLogDraft } from '@/features/logbook/draft';
import { SpotForm } from '@/features/spots/SpotForm';

export default function NewSpotScreen() {
  const { name, from } = useLocalSearchParams<{ name?: string; from?: string }>();
  const setCreatedSpotId = useLogDraft((s) => s.setCreatedSpotId);
  return (
    <SpotForm
      initialName={name}
      onCreated={
        from === 'log'
          ? (id) => {
              setCreatedSpotId(id);
              router.back();
            }
          : undefined
      }
    />
  );
}
