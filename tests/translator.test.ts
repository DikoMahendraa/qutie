import { describe, expect, it, vi } from 'vitest'
import { TranslationError, parseProviderResponse, translate } from '../src/main/translator'

function providerPayload(translated: string, detected: string): unknown {
  return [[[translated, 'source', null, null, 1]], null, detected]
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('parseProviderResponse', () => {
  it('joins every translated segment', () => {
    const payload = [[['Halo ', 'Hello '], ['dunia', 'world']], null, 'en']
    expect(parseProviderResponse(payload)).toEqual({ translated: 'Halo dunia', detected: 'en' })
  })

  it('rejects malformed payloads', () => {
    expect(() => parseProviderResponse({})).toThrow(TranslationError)
    expect(() => parseProviderResponse([[]])).toThrow(TranslationError)
  })
})

describe('translate', () => {
  it('translates Indonesian text to English with a single request', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(providerPayload('Good morning', 'id')))
    const result = await translate('Selamat pagi', fetcher)
    expect(result).toEqual({ translated: 'Good morning', from: 'id', to: 'en' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('translates English text to Indonesian with a second request', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(providerPayload('Good morning', 'en')))
      .mockResolvedValueOnce(jsonResponse(providerPayload('Selamat pagi', 'en')))
    const result = await translate('Good morning', fetcher)
    expect(result).toEqual({ translated: 'Selamat pagi', from: 'en', to: 'id' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    const secondBody = (fetcher.mock.calls[1][1] as RequestInit).body as URLSearchParams
    expect(secondBody.get('sl')).toBe('en')
    expect(secondBody.get('tl')).toBe('id')
  })

  it('reports an unreachable service', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('network down'))
    await expect(translate('Hello', fetcher)).rejects.toThrow(/internet connection/)
  })

  it('reports a non-successful status', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({}, 429))
    await expect(translate('Hello', fetcher)).rejects.toThrow(/429/)
  })
})
