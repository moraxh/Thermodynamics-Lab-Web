import { UserSchema } from "@db/schemas";
import { hash } from "@node-rs/argon2";
import { passwordHashingOptions } from "@src/pages/api/login";
import { UserRepository } from "@src/repositories/UserRepository";

export class UserService {
  static async updateUser(formData: FormData): Promise<{ status: number, message: string }> {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

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
}