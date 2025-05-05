export const supportedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export const maxImageSize = 10 * 1024 * 1024 // 10MB

export const validateImage = async (image: File): Promise<void> => {
  // Check if the file exists
  if (!image) {
    throw new Error("La imagen es requerida")
  }

  // Check if the image is a valid file
  if (image.type.startsWith("image/") === false) {
    throw new Error("El archivo no es una imagen")
  }

  // Check if the image is a supported type
  if (!supportedImageTypes.includes(image.type)) {
    throw new Error("Formato de imagen no soportado")
  }

  if (image.size > maxImageSize) {
    throw new Error("La imagen es demasiado grande (10MB máximo)")
  }
}