/// <reference types="vite/client" />

import type { QutieApi } from '@shared/types'

declare global {
  interface Window {
    qutie: QutieApi
  }
}
