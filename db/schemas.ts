import { z } from "zod"

export const UserSchema = z.object({
  username: z.string({ message: "El nombre de usuario es requerido"})
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "El nombre de usuario no puede tener mas de 20 caracteres de longitud"}),
  
  password: z.string({ message: "La contraseña es requerida"})
    .min(5, { message: "La contraseña debe tener al menos 5 caracteres de longitud"})
    .max(20, { message: "La contraseña no puede tener mas de 20 caracteres de longitud"})
})
