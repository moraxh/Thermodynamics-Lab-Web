import type { APIContext } from "astro"
import { UserSchema } from "@db/schemas";
import { db, User } from "astro:db"
import { hash } from "@node-rs/argon2"
import { passwordHashingOptions } from "../login";

export async function POST(context: APIContext):Promise<Response> {
  const formData = await context.request.formData();
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!username || !password || !confirmPassword) {
    return new Response(JSON.stringify({
      error: "Todos los campos son requeridos"
    }), { status: 400 })
  }

  try {
    const validationResult = UserSchema.safeParse({
      username,
      password
    })

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({
        error: "Las contraseñas no coinciden"
      }), { status: 400 })
    }

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: validationResult.error.issues[0].message || "Credenciales invalidas"
      }), { status: 400 })
    }

    const hashedPassword = await hash(password, passwordHashingOptions)

    // Update the user
    db.update(User)
      .set({
        username: username,
        password_hash: hashedPassword
      })
      .execute()

    return new Response(JSON.stringify({
      success: true
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), { status: 500 })
  }
}