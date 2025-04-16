import { z } from "zod"

export const UserSchema = z.object({
  username: z.string({ message: "El nombre de usuario es requerido"})
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "El nombre de usuario no puede tener mas de 20 caracteres de longitud"}),
  
  password: z.string({ message: "La contraseña es requerida"})
    .min(5, { message: "La contraseña debe tener al menos 5 caracteres de longitud"})
    .max(20, { message: "La contraseña no puede tener mas de 20 caracteres de longitud"})
})

export const MemberSchema = z.object({
  fullName: z.string({ message: "El nombre completo es requerido"})
    .min(3, { message: "El nombre completo debe tener al menos 3 caracteres de longitud"})
    .max(150, { message: "El nombre completo no puede tener mas de 70 caracteres de longitud"}),
  typeOfMember: z.string({ message: "El tipo de miembro es requerido"})
    .min(3, { message: "El tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "El tipo de miembro no puede tener mas de 20 caracteres de longitud"}),
  position: z.string({ message: "La posición del miembro es requerida"})
    .min(3, { message: "La posición debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "La posición no puede tener mas de 20 caracteres de longitud"})
})

export const MemberTypeSchema = z.object({
  name: z.string({ message: "El nombre del tipo de miembro es requerido"})
    .min(3, { message: "El nombre del tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "El nombre del tipo de miembro no puede tener mas de 20 caracteres de longitud"}),
  plural_name: z.string({ message: "El nombre del tipo de miembro es requerido"})
    .min(3, { message: "El nombre del tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(20, { message: "El nombre del tipo de miembro no puede tener mas de 20 caracteres de longitud"}),
  order: z.number()
})

export const GallerySchema = z.object({
  path: z.string({ message: "La ruta de la imagen es requerida"})
})