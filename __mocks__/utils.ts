import { createContext } from 'astro/middleware'
import type { APIContext } from "astro";

export function createMockImageFile(
  name: string = 'test.png',
  mime: string = 'image/png',
  content: string = 'fake content'
): File {
  const buffer = Buffer.from(content)
  const blob = new Blob([buffer], { type: mime })
  return new File([blob], name, { type: mime })
}

export function createMockContext(
  request: Request = new Request('http://localhost/api/test', {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }),
): APIContext {
  return createContext({
    request,
    defaultLocale : 'en',
    locals: {
      session: null,
      user: null,
    },
  });
}
