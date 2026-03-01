import { jest } from '@jest/globals'
import type { Socket } from 'socket.io-client'
import type { SocketIoOptions } from './socket'

type FakeSocket = {
  on: jest.Mock
  emit: jest.Mock
  disconnect: jest.Mock
}

type IoFn = (url: string, opts: SocketIoOptions) => Socket

describe('socket utils', () => {
  beforeEach(() => {
    jest.resetModules()
    localStorage.clear()

    globalThis.__VITE_ENV__ = {
      VITE_POSITIONS_API_URL: 'http://localhost:3000/api',
      VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
      VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
      VITE_NEWS_API_URL: 'http://localhost:6500/api',
      VITE_POSITIONS_WS_URL: 'ws://localhost:3000',
    }
  })

  it('uses POSITIONS_WS_URL when provided and includes auth token/userId', async () => {
    localStorage.setItem('ww_token', 'tkn')
    localStorage.setItem('ww_user', JSON.stringify({ id: 123 }))

    const fakeSocket: FakeSocket = { on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() }

    const ioMock: jest.MockedFunction<IoFn> = jest.fn((url, opts) => {
      expect(url).toBe('ws://localhost:3000')
      expect(opts).toEqual(
        expect.objectContaining({
          transports: ['websocket'],
          auth: { token: 'tkn', userId: 123 },
        })
      )
      return fakeSocket as unknown as Socket
    })

    const mod = await import('./socket')
    mod.__resetSocketModuleForTests()
    mod.__setIoForTests(ioMock)

    mod.getSocket()

    expect(ioMock).toHaveBeenCalledTimes(1)

    mod.__resetSocketModuleForTests()
  })

  it('resetSocket disconnects and clears singleton', async () => {
    const fakeSocket: FakeSocket = { on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() }

    const ioMock: jest.MockedFunction<IoFn> = jest.fn(() => fakeSocket as unknown as Socket)

    const mod = await import('./socket')
    mod.__resetSocketModuleForTests()
    mod.__setIoForTests(ioMock)

    mod.getSocket()
    mod.resetSocket()

    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1)

    mod.__resetSocketModuleForTests()
  })
})