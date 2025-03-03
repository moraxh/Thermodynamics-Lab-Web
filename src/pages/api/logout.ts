import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return context.redirect('/login')
}

export async function POST(context: APIContext): Promise<Response> {
  // Check if the user is logged in

  // Delete the session cookie

  // Redirect to the main page
  return context.redirect('/')
}