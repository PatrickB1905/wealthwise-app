import { renderHook, act } from '@testing-library/react'
import { makeTestQueryClient, withQueryClient } from '../test/testQueryClient'
import { usePositionWS } from './usePositionWS'

type Handler = () => void

const socket = {
  on: jest.fn(),
  off: jest.fn(),
}

jest.mock('../utils/socket', () => ({
  __esModule: true,
  getSocket: () => socket,
}))

describe('usePositionWS', () => {
  beforeEach(() => {
    socket.on.mockReset()
    socket.off.mockReset()
  })

  it('invalidates positions, quotes, and analytics on position events', () => {
    const qc = makeTestQueryClient()
    const spy = jest.spyOn(qc, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      withQueryClient(<>{children}</>, qc)

    renderHook(() => usePositionWS(), { wrapper })

    const onCalls = socket.on.mock.calls as Array<[string, Handler]>
    expect(onCalls.length).toBeGreaterThan(0)

    const handler = onCalls[0][1]

    act(() => {
      handler()
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: ['positions'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['quotes'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['analytics'] })
  })
})