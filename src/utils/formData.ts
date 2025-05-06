export const copyFormData = (formData: FormData): FormData => {
  const newFormData = new FormData()
  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob) {
      newFormData.append(key, value)
    } else {
      newFormData.append(key, String(value))
    }
  }
  return newFormData
}