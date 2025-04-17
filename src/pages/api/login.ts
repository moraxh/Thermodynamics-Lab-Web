import { lucia } from "@src/auth"
import { UserSchema } from "db/schemas"
import { verify } from "@node-rs/argon2"
import type { APIContext } from "astro"
import { db } from "@db/connection"
import { User } from "@db/tables"
import { eq } from "drizzle-orm"

export const passwordHashingOptions = {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
}

export async function GET(context: APIContext): Promise<Response> {
  return context.redirect('/login')
}

export async function POST(context: APIContext):Promise<Response> {
  const formData = await context.request.formData();
  const username = formData.get('username')
  const password = formData.get('password')

  try {
    // Validate the form data
    const validationResult = UserSchema.safeParse({
      username,
      password
    })

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: validationResult.error.issues[0].message || "Credenciales invalidas"
      }), {
        status: 400,
      })
    }

    // Check if the user exists
    const existingUser = (
      await db.select().from(User).where(eq(User.username, username as string))
    ).at(0)

    if (!existingUser) {
      return new Response(JSON.stringify({
        error: "El usuario o la contraseña no son correctos"
      }), {
        status: 400,
      })
    }

    // Check if the password is correct
    const validPassword = await verify(existingUser.passwordHash, password as string, passwordHashingOptions)

    if (!validPassword) {
      return new Response(JSON.stringify({
        error: "El usuario o la contraseña no son correctos"
      }), {
        status: 400,
      })
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), { status: 500 })
  }
}