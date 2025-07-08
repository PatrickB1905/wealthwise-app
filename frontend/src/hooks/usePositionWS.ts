import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../utils/socket';

export function usePositionWS() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const onAdded   = () => qc.invalidateQueries('positions');
    const onClosed  = () => qc.invalidateQueries('positions');
    const onUpdated = () => qc.invalidateQueries('positions');
    const onDeleted = () => qc.invalidateQueries('positions');

    socket.on('position:added',   onAdded);
    socket.on('position:closed',  onClosed);
    socket.on('position:updated', onUpdated);
    socket.on('position:deleted', onDeleted);

    return () => {
      socket.off('position:added',   onAdded);
      socket.off('position:closed',  onClosed);
      socket.off('position:updated', onUpdated);
      socket.off('position:deleted', onDeleted);
    };
  }, [qc]);
}