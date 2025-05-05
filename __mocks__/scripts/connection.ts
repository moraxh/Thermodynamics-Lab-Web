import { vi } from 'vitest'

export function mockDbConnection() {
  vi.mock('@db/connection', () => ({
    db: {
      query: vi.fn()
    }
  }))
}
