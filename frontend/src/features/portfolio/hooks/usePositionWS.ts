import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@shared/lib/socket';

const POSITION_EVENTS = [
  'position:added',
  'position:closed',
  'position:updated',
  'position:deleted',
] as const;

export function usePositionWS(): void {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const onPositionChanged = () => {
      qc.invalidateQueries({ queryKey: ['positions'] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    };

    POSITION_EVENTS.forEach((evt) => socket.on(evt, onPositionChanged));

    return () => {
      POSITION_EVENTS.forEach((evt) => socket.off(evt, onPositionChanged));
    };
  }, [qc]);
}
