import { z } from "zod"
import { publicationTypeEnum } from "@db/tables"

export const supportedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export const maxImageSize = 10 * 1024 * 1024 // 10MB
export const maxPDFSize = 20 * 1024 * 1024 // 10MB

export const ImageSchema = z.object({
  image: z.instanceof(File, { message: "La imagen es requerida"})
    .refine((file) => file.type.startsWith("image/"), { message: "El archivo debe ser una imagen"})
    .refine((file) => supportedImageTypes.includes(file.type), { message: "Formato de imagen no soportado"})
    .refine((file) => file.size <= maxImageSize, { message: "El tamaño de la imagen no puede ser mayor a 10MB"})
})

export const PDFSchema = z.object({
  file: z.instanceof(File, { message: "El archivo es requerido"})
    .refine((file) => file.type === "application/pdf", { message: "El archivo debe ser un PDF"})
    .refine((file) => file.size <= maxPDFSize, { message: "El tamaño del archivo no puede ser mayor a 10MB"})
})

export const UserSchema = z.object({
  username: z.string({ message: "El nombre de usuario es requerido"})
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "El nombre de usuario no puede tener mas de 255 caracteres de longitud"}),
  password: z.string({ message: "La contraseña es requerida"})
    .min(5, { message: "La contraseña debe tener al menos 5 caracteres de longitud"})
    .max(255, { message: "La contraseña no puede tener mas de 255 caracteres de longitud"})
})

export const MemberSchema = z.object({
  fullName: z.string({ message: "El nombre completo es requerido"})
    .min(3, { message: "El nombre completo debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "El nombre completo no puede tener mas de 255 caracteres de longitud"}),
  typeOfMember: z.string({ message: "El tipo de miembro es requerido"})
    .min(3, { message: "El tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "El tipo de miembro no puede tener mas de 255 caracteres de longitud"}),
  position: z.string({ message: "La posición del miembro es requerida"})
    .min(3, { message: "La posición debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "La posición no puede tener mas de 255 caracteres de longitud"}),
  memberPhoto: ImageSchema.shape.image
})

export const MemberTypeSchema = z.object({
  name: z.string({ message: "El nombre del tipo de miembro es requerido"})
    .min(3, { message: "El nombre del tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "El nombre del tipo de miembro no puede tener mas de 255 caracteres de longitud"}),
  pluralName: z.string({ message: "El nombre del tipo de miembro es requerido"})
    .min(3, { message: "El nombre del tipo de miembro debe tener al menos 3 caracteres de longitud"})
    .max(255, { message: "El nombre del tipo de miembro no puede tener mas de 255 caracteres de longitud"}),
  order: z.number()
})

export const GallerySchema = z.object({
  image: ImageSchema.shape.image,
})

export const PublicationSchema = z.object({
  title: z.string({ message: "El título es requerido"})
    .min(3, { message: "El título debe tener al menos 3 caracteres de longitud"})
    .max(500, { message: "El título no puede tener mas de 500 caracteres de longitud"}),
  description: z.string({ message: "La descripción es requerida"})
    .min(3, { message: "La descripción debe tener al menos 3 caracteres de longitud"})
    .max(5000, { message: "La descripción no puede tener mas de 5000 caracteres de longitud"}),
  type: z.enum(publicationTypeEnum.enumValues, { message: "El tipo de publicación es requerido"}),
  authors: z.array(z.string({ message: "El autor es requerido"}))
    .min(1, { message: "El autor es requerido"}),
  publicationDate: z.string({ message: "La fecha de publicación es requerida"})
    .date()
})

export const ArticleSchema = z.object({
  title: z.string({ message: "El título es requerido"})
    .min(3, { message: "El título debe tener al menos 3 caracteres de longitud"})
    .max(500, { message: "El título no puede tener mas de 500 caracteres de longitud"}),
  description: z.string({ message: "La descripción es requerida"})
    .min(3, { message: "La descripción debe tener al menos 3 caracteres de longitud"})
    .max(5000, { message: "La descripción no puede tener mas de 5000 caracteres de longitud"}),
  publicationDate: z.string({ message: "La fecha de publicación es requerida"}),
  thumbnail: ImageSchema.shape.image,
  file: PDFSchema.shape.file,
})