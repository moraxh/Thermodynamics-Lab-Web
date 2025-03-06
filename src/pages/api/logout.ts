import { lucia } from "@src/auth";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return context.redirect('/login')
}

export async function POST(context: APIContext): Promise<Response> {
  // Delete the session cookie
  const authSession = context.cookies.get('auth_session')

  if (authSession) {
    const { session } = await lucia.validateSession(authSession?.value)
    if (session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
  }

  // Redirect to the main page
  return context.redirect('/')
}