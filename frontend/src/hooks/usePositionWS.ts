import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket;

export function usePositionWS() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:4000', {
      auth: { userId: user.id }
    });
    socket.emit('join', user.id);

    socket.on('position:added',   () => queryClient.invalidateQueries(['positions']));
    socket.on('position:closed',  () => queryClient.invalidateQueries(['positions']));
    socket.on('position:updated', () => queryClient.invalidateQueries(['positions']));
    socket.on('position:deleted', () => queryClient.invalidateQueries(['positions']));

    return () => { socket.disconnect(); };
  }, [user, queryClient]);

  return socket;
}