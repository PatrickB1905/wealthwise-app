import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../utils/socket'

export function usePositionWS(): void {
  const qc = useQueryClient()

  useEffect(() => {
    const socket = getSocket()

    const invalidatePositions = () => {
      qc.invalidateQueries({ queryKey: ['positions'] })
    }

    socket.on('position:added', invalidatePositions)
    socket.on('position:closed', invalidatePositions)
    socket.on('position:updated', invalidatePositions)
    socket.on('position:deleted', invalidatePositions)

    return () => {
      socket.off('position:added', invalidatePositions)
      socket.off('position:closed', invalidatePositions)
      socket.off('position:updated', invalidatePositions)
      socket.off('position:deleted', invalidatePositions)
    }
  }, [qc])
}
