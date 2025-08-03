import {
  beforeEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { copyFormData } from '@src/utils/formData';
import { createMockContext, createMockImageFile, createMockPDFFile } from '@__mocks__/utils';
import {
  DELETE,
  GET,
  POST,
  PUT
  } from '@api/publications';
import { PublicationRepository } from '@src/repositories/PublicationRepository';
import type { PublicationSelect } from '@src/repositories/PublicationRepository';

vi.mock('@src/repositories/PublicationRepository')

beforeEach(() => {
  vi.restoreAllMocks()
})

const mockPublications: PublicationSelect[] = [
  {
    id: "1",
    title: "Publication 1",
    description: "Description 1",
    type: "article",
    authors: ["Author 1"],
    publicationDate: new Date("2023-01-01"),
    filePath: "/path/to/file1.pdf", 
    thumbnailPath: "/path/to/thumbnail1.webp",
  },
  {
    id: "2",
    title: "Publication 2",
    description: "Description 2",
    type: "book",
    authors: ["Author 2"],
    publicationDate: new Date("2023-02-01"),
    filePath: "/path/to/file2.pdf", 
    thumbnailPath: "/path/to/thumbnail2.webp",
  },
]

describe('GET /publications', () => {
  it('should return publications with no params', async() => {
    vi.spyOn(PublicationRepository, 'getPublications').mockResolvedValue(mockPublications)
    vi.spyOn(PublicationRepository, 'getNumberOfPublications').mockResolvedValue(mockPublications.length)

    const context = createMockContext(
      new Request('http://localhost:3000/api/publications')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.info).toEqual({
      total: mockPublications.length,
      page: 1,
      size: mockPublications.length,
      limit: 9
    })
    expect(data.publications).toEqual(mockPublications.map((publication) => ({
      ...publication,
      publicationDate: publication.publicationDate.toISOString(),
    })))
  })

  it('should return publications with page param', async() => {
    const mockPublicationsFiltered = mockPublications.filter(publication => publication.type === 'article')
    vi.spyOn(PublicationRepository, 'getPublications').mockResolvedValue(mockPublicationsFiltered)
    vi.spyOn(PublicationRepository, 'getNumberOfPublications').mockResolvedValue(mockPublicationsFiltered.length)

    const context = createMockContext(
      new Request('http://localhost:3000/api/publications?page=1&type=article&limit=2')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.info).toEqual({
      total: 1,
      page: 1,
      size: 1,
      limit: 2
    })
    expect(data.publications).toEqual(mockPublicationsFiltered.map((publication) => ({
      ...publication,
      publicationDate: publication.publicationDate.toISOString(),
    })))
  })

  it('should return an empty array if there are no publications', async() => {
    vi.spyOn(PublicationRepository, 'getPublications').mockResolvedValue([])
    vi.spyOn(PublicationRepository, 'getNumberOfPublications').mockResolvedValue(0)

    const context = createMockContext(
      new Request('http://localhost:3000/api/publications')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.info).toEqual({
      total: 0,
      page: 1,
      size: 0,
      limit: 9
    })
    expect(data.publications).toEqual([])
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(PublicationRepository, 'getPublications').mockRejectedValueOnce(new Error('Database error'))
    vi.spyOn(PublicationRepository, 'getNumberOfPublications').mockRejectedValueOnce(new Error('Database error'))

    const context = createMockContext(
      new Request('http://localhost:3000/api/publications')
    )

    const response = await GET(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.info).toBeUndefined()
    expect(data.message).toBe("Error al obtener las publicaciones")
  })
})

describe('POST /publications', () => {
  const validFormData = new FormData()
  validFormData.append('title', 'Test Publication')
  validFormData.append('description', 'Test publication description')
  validFormData.append('type', 'article')
  validFormData.append('authors', JSON.stringify(['Author 1', 'Author 2']))
  validFormData.append('publicationDate', '2023-01-01')
  validFormData.append('file', createMockPDFFile())
  validFormData.append('thumbnail', createMockImageFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('title', 'Test Publication URL')
  validFormDataWithUrl.append('description', 'Test publication description with URL')
  validFormDataWithUrl.append('type', 'book')
  validFormDataWithUrl.append('authors', JSON.stringify(['Author 3']))
  validFormDataWithUrl.append('publicationDate', '2023-01-01')
  validFormDataWithUrl.append('fileUrl', 'https://example.com/publication.pdf')
  validFormDataWithUrl.append('thumbnail', createMockImageFile())

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request('http://localhost:3000/api/publications', {
        method: 'POST',
        body: formData,
      })
    )
  }

  it('should create a publication with file', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'insertPublications').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Publicación creada correctamente')
  })

  it('should create a publication with URL', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'insertPublications').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Publicación creada correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al crear la publicación')
  })

  it('should return an error if required parameters are not provided', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
      type: "El tipo de publicación es requerido",
      authors: "Los autores son requeridos",
      publicationDate: "La fecha de publicación es requerida",
      thumbnail: "La imagen es requerida",
      file: "Debe proporcionar un archivo o una URL",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const formData = copyFormData(validFormData)
      formData.delete(key)

      const context = createValidContext(formData)
      
      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if parameters are invalid', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

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
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const shortFormData = copyFormData(validFormData)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await POST(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Test maximum length
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const longFormData = copyFormData(validFormData)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await POST(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if the title is already in use', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(mockPublications[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the file is already in use', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce(mockPublications[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El archivo ya está en uso')
  })

  it('should return an error if the thumbnail is already in use', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByThumbnailHash').mockResolvedValueOnce(mockPublications[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al crear la publicación')
  })
})
describe('PUT /publications', () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')
  validFormData.append('title', 'Updated Publication')
  validFormData.append('description', 'Updated publication description')
  validFormData.append('type', 'article')
  validFormData.append('authors', JSON.stringify(['Updated Author']))
  validFormData.append('publicationDate', '2023-06-01')
  validFormData.append('file', createMockPDFFile())
  validFormData.append('thumbnail', createMockImageFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('id', '1')
  validFormDataWithUrl.append('title', 'Updated Publication URL')
  validFormDataWithUrl.append('description', 'Updated publication description with URL')
  validFormDataWithUrl.append('type', 'book')
  validFormDataWithUrl.append('authors', JSON.stringify(['Updated Author']))
  validFormDataWithUrl.append('publicationDate', '2023-06-01')
  validFormDataWithUrl.append('fileUrl', 'https://example.com/updated-publication.pdf')

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request('http://localhost:3000/api/publications', {
        method: 'PUT',
        body: formData,
      })
    )
  }

  it('should update a publication', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'updatePublicationById').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Publicación actualizada correctamente')
  })

  it('should update a publication with URL', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'updatePublicationById').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await PUT(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Publicación actualizada correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext()

    const response = await PUT(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al actualizar la publicación')
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await PUT(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID de la publicación es requerido')
  })

  it('should return an error if the publication does not exist', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('Publicación no encontrada')
  })

  it('should return an error if required parameters are not provided', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
      type: "El tipo de publicación es requerido",
      authors: "El autor es requerido",
      publicationDate: "La fecha de publicación es requerida",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const formData = copyFormData(validFormData)
      formData.delete(key)

      const context = createValidContext(formData)

      const response = await PUT(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if the title is already in use by another publication', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce({
      ...mockPublications[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the file is already in use by another publication', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce({
      ...mockPublications[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El archivo ya está en uso')
  })

  it('should return an error if the thumbnail is already in use by another publication', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(PublicationRepository, 'getPublicationByThumbnailHash').mockResolvedValueOnce({
      ...mockPublications[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  })

  it('should return an error if parameters are invalid', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

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
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const shortFormData = copyFormData(validFormData)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await PUT(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Test maximum length
      vi.clearAllMocks()
      vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
      vi.spyOn(PublicationRepository, 'getPublicationByTitle').mockResolvedValueOnce(null)

      const longFormData = copyFormData(validFormData)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await PUT(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await PUT(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al actualizar la publicación')
  })
})
describe('DELETE /publications', () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request('http://localhost:3000/api/publications', {
        method: 'DELETE',
        body: formData,
      })
    )
  }

  it('should delete a publication', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(mockPublications[0])
    vi.spyOn(PublicationRepository, 'deletePublicationById').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Publicación eliminada correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al eliminar la publicación')
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID de la publicación es requerido')
  })

  it('should return an error if the publication does not exist', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('Publicación no encontrada')
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(PublicationRepository, 'getPublicationById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al eliminar la publicación')
  })
})