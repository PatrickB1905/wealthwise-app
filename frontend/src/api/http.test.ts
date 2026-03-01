import axios from 'axios'
import { AUTH_EVENTS, __resetUnauthorizedForTests, createHttpClient, getErrorMessage } from './http'
import { STORAGE_KEYS } from '../config/env'

type AxiosRequestConfigLike = { headers?: Record<string, unknown> }

type InterceptorHandler<T> = {
  fulfilled: (value: T) => T | Promise<T>
  rejected?: (error: unknown) => unknown
}

type InterceptorManagerWithHandlers<T> = {
  handlers: Array<InterceptorHandler<T>>
}

describe('http', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
    __resetUnauthorizedForTests()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('adds Authorization header when token exists', async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'token123')

    const client = createHttpClient('http://example.com')

    const requestInterceptors = client.interceptors.request as unknown as InterceptorManagerWithHandlers<AxiosRequestConfigLike>
    const handler = requestInterceptors.handlers[0]?.fulfilled
    expect(handler).toBeDefined()

    const cfg = await handler({ headers: {} })

    expect((cfg.headers as Record<string, unknown>).Authorization).toBe('Bearer token123')
  })

  it('on 401 clears storage and emits unauthorized event (throttled)', async () => {
    const client = createHttpClient('http://example.com')

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'token123')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 1 }))

    const onUnauthorized = jest.fn()
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized)

    const errorObj: unknown = {
      response: { status: 401, data: { error: 'nope' } },
      isAxiosError: true,
    }

    const spy = jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    const responseInterceptors = client.interceptors.response as unknown as InterceptorManagerWithHandlers<unknown>
    const rejected = responseInterceptors.handlers[0]?.rejected
    expect(rejected).toBeDefined()

    await expect(rejected!(errorObj)).rejects.toBeDefined()

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledTimes(1)

    await expect(rejected!(errorObj)).rejects.toBeDefined()
    expect(onUnauthorized).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await expect(rejected!(errorObj)).rejects.toBeDefined()
    expect(onUnauthorized).toHaveBeenCalledTimes(2)

    spy.mockRestore()
    window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized)
  })

  it('getErrorMessage returns server error when axios error includes response.data.error', () => {
    const spy = jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    const err: unknown = { response: { data: { error: 'Bad login' } } }
    expect(getErrorMessage(err, 'Fallback')).toBe('Bad login')

    spy.mockRestore()
  })

  it('getErrorMessage returns fallback when not axios error', () => {
    const spy = jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)
    expect(getErrorMessage(new Error('x'), 'Fallback')).toBe('Fallback')
    spy.mockRestore()
  })
})