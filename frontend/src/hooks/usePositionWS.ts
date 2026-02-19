import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../utils/socket'

const POSITION_EVENTS = [
  'position:added',
  'position:closed',
  'position:updated',
  'position:deleted',
] as const

export function usePositionWS(): void {
  const qc = useQueryClient()

  useEffect(() => {
    const socket = getSocket()

    const invalidatePositions = () => {
      qc.invalidateQueries({ queryKey: ['positions'] })
    }

    POSITION_EVENTS.forEach((evt) => socket.on(evt, invalidatePositions))

    return () => {
      POSITION_EVENTS.forEach((evt) => socket.off(evt, invalidatePositions))
    }
  }, [qc])
}
