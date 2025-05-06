import { UserSchema } from "@db/schemas";
import { hash } from "@node-rs/argon2";
import { UserRepository } from "@src/repositories/UserRepository";
import { verify } from "@node-rs/argon2"
import { generateIdFromEntropySize } from "lucia";
import * as crypto from 'node:crypto'

import type { UserInsert } from "@src/repositories/UserRepository";
import type { CommonResponse } from "@src/types";
import { lucia } from "@src/auth";
import type { APIContext, AstroCookies } from "astro";

export const passwordHashingOptions = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
}

export class UserService {
  static async login(formData: FormData, context: APIContext): Promise<CommonResponse> {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // Check if all the fields are filled
    if (!username || !password) {
      let error;
      if (!username)
        error = "El nombre de usuario es requerido"
      else 
        error = "La contraseña es requerida"

      return {
        status: 400,
        message: error
      }
    }

    // Check if the user exists
    const existingUser = await UserRepository.findUserByUsername(username)

    if (!existingUser) {
      return {
        status: 400,
        message: "El usuario o la contraseña no son correctos"
      }
    }

    // Check if the password is correct
    const validPassword = await verify(
      existingUser.passwordHash,
      password,
      passwordHashingOptions
    )
    
    if (!validPassword) {
      return {
        status: 400,
        message: "El usuario o la contraseña no son correctos"
      }
    }

    // Create a session
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return {
      status: 200,
      message: "Usuario autenticado correctamente"
    }
  }

  static async logout(authSession: any, context: APIContext): Promise<CommonResponse> {
    if (!authSession) {
      return {
        status: 400,
        message: "No se encontró la sesión"
      }
    }

    const { session } = await lucia.validateSession(authSession?.value)
    if (!session) {
      return {
        status: 400,
        message: "La sesión no es válida"
      }
    }

    const sessionCookie = lucia.createBlankSessionCookie()
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return {
      status: 200,
      message: "Sesión cerrada correctamente"
    }
  }

  static async updateUser(formData: FormData): Promise<CommonResponse> {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Check if all the fields are filled
    if (!username || !password || !confirmPassword) {
      let error;
      if (!username) error = "El nombre de usuario es requerido"
      else if (!password) error = "La contraseña es requerida"
      else if (!confirmPassword) error = "La confirmación de contraseña es requerida"
      else error = "Error interno del servidor"

      return {
        status: 400,
        message: error
      }
    }

    // Check if the password and confirm password are the same
    if (password !== confirmPassword) {
      return {
        status: 400,
        message: "Las contraseñas no coinciden"
      }
    }

    const validation = UserSchema.safeParse({
      username,
      password
    })

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.issues[0].message || "Credenciales invalidas"
      }
    }

    // Hash the password
    const hashedPassword = await hash(password, passwordHashingOptions)

    // Update the user in the db
    await UserRepository.updateUser(username, hashedPassword)

    return {
      status: 200,
      message: "Usuario actualizado correctamente"
    }
  }

  static async clearData(): Promise<void> {
    // Delete the table data
    await UserRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    const defaultPassword = 
      import.meta.env.PROD
        ? crypto.randomBytes(10).toString('hex')
        : "admin"
    
    console.info(`Default credentials: \nUsername: admin \nPassword: ${defaultPassword}`)

    const defaultUser: UserInsert = {
      id: generateIdFromEntropySize(10),
      username: "admin",
      passwordHash: await hash(defaultPassword, passwordHashingOptions),
    }

    await UserRepository.insertUsers([defaultUser])
  }
}