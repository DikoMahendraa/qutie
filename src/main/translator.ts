import { MAX_TEXT_LENGTH } from '@shared/constants'
import type { LanguageCode } from '@shared/types'

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'
const REQUEST_TIMEOUT_MS = 8000

export interface Translation {
  translated: string
  from: string
  to: LanguageCode
}

export class TranslationError extends Error {}

interface ProviderResult {
  translated: string
  detected: string
}

export type Fetcher = typeof fetch

async function requestTranslation(
  text: string,
  source: string,
  target: LanguageCode,
  fetcher: Fetcher
): Promise<ProviderResult> {
  const body = new URLSearchParams({
    client: 'gtx',
    sl: source,
    tl: target,
    dt: 't',
    q: text
  })

  let response: Response
  try {
    response = await fetcher(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
  } catch {
    throw new TranslationError('Could not reach the translation service. Check your internet connection.')
  }

  if (!response.ok) {
    throw new TranslationError(`The translation service responded with status ${response.status}.`)
  }

  return parseProviderResponse(await response.json().catch(() => null))
}

export function parseProviderResponse(payload: unknown): ProviderResult {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new TranslationError('The translation service returned an unexpected response.')
  }

  const translated = (payload[0] as unknown[])
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
    .join('')

  const detected = typeof payload[2] === 'string' ? payload[2] : 'auto'

  if (translated.length === 0) {
    throw new TranslationError('The translation service returned an empty result.')
  }

  return { translated, detected }
}

export async function translate(rawText: string, fetcher: Fetcher = fetch): Promise<Translation> {
  const text = rawText.trim().slice(0, MAX_TEXT_LENGTH)

  const toEnglish = await requestTranslation(text, 'auto', 'en', fetcher)
  if (toEnglish.detected !== 'en') {
    return { translated: toEnglish.translated, from: toEnglish.detected, to: 'en' }
  }

  const toIndonesian = await requestTranslation(text, 'en', 'id', fetcher)
  return { translated: toIndonesian.translated, from: 'en', to: 'id' }
}
