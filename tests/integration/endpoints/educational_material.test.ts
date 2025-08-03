import {
  beforeEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { copyFormData } from '@src/utils/formData';
import { createMockContext, createMockPDFFile } from '@__mocks__/utils';
import {
  DELETE,
  GET,
  PATCH,
  POST
  } from '@api/educational_material';
import { EducationalMaterialRepository } from '@src/repositories/EducationalMaterialRepository';
import type { EducationalMaterialSelect } from "@src/repositories/EducationalMaterialRepository"
import type { APIContext } from 'astro'

vi.mock('fs', () => import('@__mocks__/modules/fs'))
vi.mock('@src/repositories/EducationalMaterialRepository')
vi.mock('@src/repositories/MemberRepository')
vi.mock('@src/utils/Hash', () => ({
  generateHashFromStream: vi.fn().mockResolvedValue('mocked-hash')
}))
vi.mock('lucia', () => ({
  generateIdFromEntropySize: vi.fn().mockReturnValue('mocked-id')
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

const mockEducationalMaterials: EducationalMaterialSelect[] = [
  {
    id: '1',
    title: 'Educational Material 1',
    description: 'Description of educational material 1',
    filePath: 'path/to/file1.pdf',
    uploadedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Educational Material 2',
    description: 'Description of educational material 2',
    filePath: 'path/to/file2.pdf',
    uploadedAt: new Date('2023-01-01'),
  }
]

describe('GET /educational_material', async () => {
  const createValidContext = (url: string = "http://localhost/api/educational_material"): APIContext => {
    return createMockContext(
      new Request(url)
    )
  }

  it('should return a list of educational materials without params', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterial').mockResolvedValueOnce(mockEducationalMaterials)
    vi.spyOn(EducationalMaterialRepository, 'getNumberOfEducationalMaterial').mockResolvedValueOnce(mockEducationalMaterials.length)

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.educational_materials).toEqual(
      mockEducationalMaterials.map(material => ({
        ...material,
        uploadedAt: new Date(material.uploadedAt).toISOString()
      }))
    )

    expect(EducationalMaterialRepository.getEducationalMaterial).toHaveBeenCalled()
  })

  it('should return a list of educational materials with params', async () => {
    const page = 1
    const limit = 5
    const total = 10

    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterial').mockResolvedValueOnce(mockEducationalMaterials)
    vi.spyOn(EducationalMaterialRepository, 'getNumberOfEducationalMaterial').mockResolvedValueOnce(total)

    const context = createValidContext("http://localhost/api/educational_material?page=1&limit=5")

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.info.page).toBe(page)
    expect(body.info.limit).toBe(limit)
    expect(body.info.total).toBe(total)
    expect(body.educational_materials).toEqual(
      mockEducationalMaterials.map(material => ({
        ...material,
        uploadedAt: new Date(material.uploadedAt).toISOString()
      }))
    )

    expect(EducationalMaterialRepository.getEducationalMaterial).toHaveBeenCalledWith(page, limit)
  })

  it('should return an empty list when no educational materials are found', async () => {
    const page = 1
    const limit = 5
    const total = 0

    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterial').mockResolvedValueOnce([])
    vi.spyOn(EducationalMaterialRepository, 'getNumberOfEducationalMaterial').mockResolvedValueOnce(total)

    const context = createValidContext("http://localhost/api/educational_material?page=1&limit=5")

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.info.page).toBe(page)
    expect(body.info.limit).toBe(limit)
    expect(body.info.total).toBe(total)
    expect(body.educational_materials).toEqual([])

    expect(EducationalMaterialRepository.getEducationalMaterial).toHaveBeenCalledWith(page, limit)  
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterial').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBe("Error al obtener los recursos")
  })
})

describe('POST /educational_material', async () => {
  const validFormData = new FormData()
  validFormData.append('title', 'Educational Material Test')
  validFormData.append('description', 'Description of educational material test')
  validFormData.append('file', createMockPDFFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('title', 'Educational Material Test')
  validFormDataWithUrl.append('description', 'Description of educational material test')
  validFormDataWithUrl.append('fileUrl', 'https://example.com/document.pdf')

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/educational_material', {
        method: 'POST',
        body: formData,
      })
    )
  }

  it('should create an educational material with file', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'insertEducationalMaterial').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo creado exitosamente')
  })

  it('should create an educational material with file URL', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'insertEducationalMaterial').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo creado exitosamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el recurso")
  })

  it('should return an error if required parameters are not provided', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)

    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      const formData = copyFormData(validFormData)
      formData.delete(key)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if parameters are invalid', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)

    const testCases = {
      title: {
        limits: { min: 3, max: 500 },
        errorMessages: {
          min: "El título debe tener al menos 3 caracteres de longitud",
          max: "El título no puede tener mas de 500 caracteres de longitud",
        }
      },
      description: {
        limits: { min: 3, max: 5000 },
        errorMessages: {
          min: "La descripción debe tener al menos 3 caracteres de longitud",
          max: "La descripción no puede tener mas de 5000 caracteres de longitud",
        }
      },
    }

    await Promise.all(Object.entries(testCases).map(async ([key, info]) => {
      // Test minimum length
      const shortFormData = copyFormData(validFormData)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await POST(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Test maximum length
      const longFormData = copyFormData(validFormData)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await POST(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if neither file nor fileUrl is provided', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('title', 'Educational Material Test')
    formData.append('description', 'Description test')

    const context = createValidContext(formData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("Debe proporcionar un archivo o una URL de archivo")
  })

  it('should return an error if the title is already in use', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(mockEducationalMaterials[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Ya existe un recurso educativo con ese título')
  })

  it('should return an error if the file is already in use', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(mockEducationalMaterials[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Ya existe un recurso educativo con ese archivo')
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el recurso")
  })
})

describe('PATCH /educational_material', async () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')
  validFormData.append('title', 'Updated Educational Material')
  validFormData.append('description', 'Updated description')
  validFormData.append('file', createMockPDFFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('id', '1')
  validFormDataWithUrl.append('title', 'Updated Educational Material')
  validFormDataWithUrl.append('description', 'Updated description')
  validFormDataWithUrl.append('fileUrl', 'https://example.com/updated-document.pdf')

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/educational_material', {
        method: 'PATCH',
        body: formData,
      })
    )
  }

  it('should update an educational material', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'updateEducationalMaterial').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo actualizado exitosamente')
  })

  it('should update an educational material with URL', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'updateEducationalMaterial').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo actualizado exitosamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el recurso")
  })

  it('should return an error if the id is not provided', async () => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del recurso educativo es requerido')
  })

  it('should return an error if the educational material does not exist', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo no encontrado')
  })

  it('should return an error if the title is already in use by another material', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce({
      ...mockEducationalMaterials[1],
      id: '2' // Different ID
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Ya existe un recurso educativo con ese título')
  })

  it('should return an error if the file is already in use by another material', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce({
      ...mockEducationalMaterials[1],
      id: '2' // Different ID
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Ya existe un recurso educativo con ese archivo')
  })

  it('should return an error if parameters are invalid', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)

    const testCases = {
      title: {
        limits: { min: 3, max: 500 },
        errorMessages: {
          min: "El título debe tener al menos 3 caracteres de longitud",
          max: "El título no puede tener mas de 500 caracteres de longitud",
        }
      },
      description: {
        limits: { min: 3, max: 5000 },
        errorMessages: {
          min: "La descripción debe tener al menos 3 caracteres de longitud",
          max: "La descripción no puede tener mas de 5000 caracteres de longitud",
        }
      },
    }

    await Promise.all(Object.entries(testCases).map(async ([key, info]) => {
      // Reset mocks for each iteration
      vi.clearAllMocks()
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)

      // Test minimum length
      const shortFormData = copyFormData(validFormData)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await PATCH(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Reset mocks again
      vi.clearAllMocks()
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByTitle').mockResolvedValueOnce(null)
      vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterialByFileHash').mockResolvedValueOnce(null)

      // Test maximum length
      const longFormData = copyFormData(validFormData)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await PATCH(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el recurso")
  })
})

describe('DELETE /educational_material', async () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/educational_material', {
        method: 'DELETE',
        body: formData,
      })
    )
  }

  it('should delete an educational material', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(mockEducationalMaterials[0])
    vi.spyOn(EducationalMaterialRepository, 'deleteEducationalMaterial').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo eliminado exitosamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el recurso")
  })

  it('should return an error if the id is not provided', async () => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del recurso educativo es requerido')
  })

  it('should return an error if the educational material does not exist', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('Recurso educativo no encontrado')
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMetarialById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el recurso")
  })
})