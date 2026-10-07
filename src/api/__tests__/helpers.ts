import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface FakeReply {
  status: number
  data?: unknown
  headers?: Record<string, string>
}

export interface RecordedCall {
  method?: string
  url?: string
  data?: unknown
  headers: Record<string, unknown>
}

/** Axios adapter that answers from a queue / function and records every call. */
export function fakeAdapter(reply: (cfg: InternalAxiosRequestConfig, n: number) => FakeReply | Error) {
  const calls: RecordedCall[] = []

  const adapter: AxiosAdapter = async cfg => {
    const n = calls.length

    calls.push({
      method: cfg.method,
      url: cfg.url,
      data: cfg.data,
      headers: { ...(cfg.headers as AxiosHeaders).toJSON() },
    })

    const r = reply(cfg, n)
    if (r instanceof Error)
      throw new AxiosError(r.message, 'ERR_NETWORK', cfg)

    const response: AxiosResponse = {
      status: r.status,
      statusText: String(r.status),
      data: r.data ?? '',
      headers: new AxiosHeaders(r.headers ?? {}),
      config: cfg,
    }

    if (r.status >= 400)
      throw new AxiosError(`HTTP ${r.status}`, 'ERR_BAD_RESPONSE', cfg, null, response)

    return response
  }

  return { adapter, calls }
}

export const errorBody = (code: string, extra: Record<string, unknown> = {}) => ({
  error: { code, message: `msg ${code}`, requestId: 'req-1', ...extra },
})
