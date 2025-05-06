import type { Cookie } from "lucia"
import { vi } from "vitest"

interface Session {
  name: string
  value: string
  attributes: {
    httpOnly: boolean
    secure: boolean
  }
}

const dummySession: Session = {
  name: "session-cookie-name",
  value: "session-cookie-value",
  attributes: {
    httpOnly: true,
    secure: true,
  }
}

const dummySessionCookie: Cookie = {
  name: "session-cookie-name",
  value: "session-cookie-value",
  attributes: {
    httpOnly: true,
    secure: true,
  },
  serialize: () => {
    return `${encodeURIComponent("session-cookie-name")}=${encodeURIComponent("session-cookie-value")}; HttpOnly; Secure`;
  },
};

class LuciaMock {
  createSession = vi.fn(async (): Promise<Session> => dummySession)
  createSessionCookie = vi.fn((): Cookie => dummySessionCookie)
  createBlankSessionCookie = vi.fn((): Cookie => dummySessionCookie) 
  validateSession = vi.fn(() => {
    return {
      session: dummySession
    }
  })
}

export const Lucia = LuciaMock
export default Lucia
