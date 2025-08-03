import { ArticleRepository } from '@src/repositories/ArticleRepository';
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
  PATCH,
  POST
  } from '@api/articles';
import { maxImageSize, maxPDFSize } from '@db/schemas';
import type { ArticleSelect } from '@src/repositories/ArticleRepository';
import type { APIContext } from 'astro';

vi.mock('@src/repositories/ArticleRepository')

beforeEach(() => {
  vi.restoreAllMocks()
})

const mockArticles: ArticleSelect[] = [
  {
    id: '1',
    title: 'Article 1',
    description: 'Description of article 1',
    authors: ['Author 1', 'Author 2'],
    publicationDate: new Date('2023-01-01'),  
    filePath: 'path/to/file1.pdf',
    thumbnailPath: 'path/to/thumbnail1.jpg',
  },
  {
    id: '2',
    title: 'Article 2',
    description: 'Description of article 2',
    authors: ['Author 1', 'Author 2'],
    publicationDate: new Date('2023-01-02'),  
    filePath: 'path/to/file2.pdf',
    thumbnailPath: 'path/to/thumbnail2.jpg',
  }
]

const URL = 'http://localhost/api/articles'

describe('GET /articles', async () => {
  const getValidContext = (uri = URL): APIContext => {
    return createMockContext(
      new Request(uri)
    )
  }

  it('should return a list of articles without params', async () => {
    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce(mockArticles)

    const context = getValidContext()

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.articles).toEqual(
      mockArticles.map(article => ({
        ...article,
        publicationDate: new Date(article.publicationDate).toISOString()
      }))
    )
  })

  it('should return a list of articles with params', async () => {
    const page = 1
    const limit = 5
    const total = 10

    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce(mockArticles)
    vi.spyOn(ArticleRepository, 'getNumberOfArticles').mockResolvedValueOnce(total)

    const uri = `${URL}?page=${page}&limit=${limit}`
    const context = getValidContext(uri)

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toEqual({
      total,
      page,
      size: mockArticles.length,
      limit
    })
    expect(body.articles).toEqual(
      mockArticles.map(article => ({
        ...article,
        publicationDate: new Date(article.publicationDate).toISOString()
      }))
    )
  })

  it('should return an empty list of articles if no articles are found', async () => {
    const page = 1
    const limit = 5
    const total = 0

    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce([])
    vi.spyOn(ArticleRepository, 'getNumberOfArticles').mockResolvedValueOnce(total)


    const url = `${URL}?page=${page}&limit=${limit}`
    const context = getValidContext(url)

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()  
    expect(body.info).toEqual({
      total,
      page,
      size: 0,
      limit
    })
    expect(body.articles).toEqual([])
  })

  it('should return an error if something goes wrong on the repository', async () => {
    vi.spyOn(ArticleRepository, 'getArticles').mockRejectedValueOnce(new Error('Database error'))

    const context = getValidContext()

    const response = await GET(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()
  })
})

describe('POST /articles', async() => {
  const validFormData = new FormData()
  validFormData.append('title', 'Article 1')
  validFormData.append('description', 'Description of article 1')
  validFormData.append('authors', JSON.stringify(['Author 1', 'Author 2']))
  validFormData.append('publicationDate', '2023-01-01')
  validFormData.append('file', createMockPDFFile())
  validFormData.append('thumbnail', createMockImageFile())

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request(URL, {
        method: 'POST',
        body: formData,
      })
    )
  }

  it('should create an article', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'insertArticles').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Articulo creado correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)

    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el artículo")
  })

  it('should return an error if the parameters are no provided', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)
    
    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
      authors: "El autor es requerido",
      publicationDate: "La fecha de publicación es requerida",
      thumbnail: "La imagen es requerida",
      file: "Debe proporcionar un archivo o una URL",
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

  it('should return an error if the parameters are invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)
    
    const testCases = {
      title: {
        "limits": {
          min: 3,
          max: 500,
        },
        "errorMessages": {
          min: "El título debe tener al menos 3 caracteres de longitud",
          max: "El título no puede tener mas de 500 caracteres de longitud",
        }
      },
      description: {
        "limits": {
          min: 3,
          max: 5000,
        },
        "errorMessages": {
          min: "La descripción debe tener al menos 3 caracteres de longitud",
          max: "La descripción no puede tener mas de 5000 caracteres de longitud",
        }
      },
    }

    await Promise.all(Object.entries(testCases).map(async ([key, info]) => {
      // Min
      await (async () => {
        const formData = copyFormData(validFormData)
        formData.set(key, 'a'.repeat(info.limits.min - 1))

        const context = createValidContext(formData)

        const response = await POST(context)
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.message).toBe(info.errorMessages.min)
      })()

      // Max
      await (async () => {
        const formData = copyFormData(validFormData)
        formData.set(key, 'a'.repeat(info.limits.max + 1))

        const context = createValidContext(formData)

        const response = await POST(context)
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.message).toBe(info.errorMessages.max)
      })()
    }))
  })

  it('should return an error if the file is invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)

    // No PDF
    await (async () => {
      const file = createMockPDFFile(
        "text.txt",
        "text/plain",
        "this is not a pdf file"
      )

      const formData = copyFormData(validFormData)
      formData.set('file', file)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe("El archivo debe ser un PDF")
    })()

    // To large
    await (async () => {
      const file = createMockPDFFile(
        "file.pdf",
        "application/pdf",
        "H".repeat(maxPDFSize + 1)
      )

      const formData = copyFormData(validFormData)
      formData.set('file', file)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe("El tamaño del archivo no puede ser mayor a 10MB")  
    })()
  })

  it('should return an error if the thumbnail is invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)

    // No image 
    await (async () => {
      const image = createMockImageFile(
        "text.txt",
        "text/plain",
        "this is not an image file"
      )

      const formData = copyFormData(validFormData)
      formData.set('thumbnail', image)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe("El archivo debe ser una imagen")
    })()

    // Invalid image format
    await (async () => {
      const image = createMockImageFile(
        "gif.gif",
        "image/gif",
        "this is a gif file"
      )

      const formData = copyFormData(validFormData)
      formData.set('thumbnail', image)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe("Formato de imagen no soportado")
    })()

    // Too large
    await (async () => {
      const image = createMockImageFile(
        "image.png",
        "image/png",
        "H".repeat(maxImageSize + 1)
      )

      const formData = copyFormData(validFormData)
      formData.set('thumbnail', image)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe("El tamaño de la imagen no puede ser mayor a 10MB")
    })()
  })

  it('should return an error if the title is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the file is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El archivo ya está en uso')
  }) 

  it('should return an error if the thumbnail is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(mockArticles[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  }) 

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockRejectedValueOnce(new Error('Database error'))
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockRejectedValueOnce(new Error('Database error'))
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el artículo")
  })
})

// TODO: Checar si la implementacion es la correcta para ver lo que querian los doctores
describe('PATCH /articles', async() => {
  const validFormData = new FormData()
  validFormData.append('id', '1')
  validFormData.append('title', 'Updated Article')
  validFormData.append('description', 'Updated description')
  validFormData.append('authors', JSON.stringify(['Updated Author']))
  validFormData.append('publicationDate', '2023-06-01')
  validFormData.append('file', createMockPDFFile())
  validFormData.append('thumbnail', createMockImageFile())

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/articles', {
        method: 'PATCH',
        body: formData,
      })
    )
  }

  it('should update an article', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'updateArticleById').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Artículo actualizado correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext()

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el articulo")
  })

  it('should return an error if the parameters are no provided', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    
    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
      authors: "El autor es requerido",
      publicationDate: "La fecha de publicación es requerida",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      vi.clearAllMocks()
      vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
      vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)

      const formData = copyFormData(validFormData)
      formData.delete(key)

      const context = createValidContext(formData)

      const response = await PATCH(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if the parameters are invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    
    const testCases = {
      title: {
        "limits": {
          min: 3,
          max: 500,
        },
        "errorMessages": {
          min: "El título debe tener al menos 3 caracteres de longitud",
          max: "El título no puede tener mas de 500 caracteres de longitud",
        }
      },
      description: {
        "limits": {
          min: 3,
          max: 5000,
        },
        "errorMessages": {
          min: "La descripción debe tener al menos 3 caracteres de longitud",
          max: "La descripción no puede tener mas de 5000 caracteres de longitud",
        }
      },
    }

    await Promise.all(Object.entries(testCases).map(async ([key, info]) => {
      // Test minimum length
      vi.clearAllMocks()
      vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
      vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)

      const shortFormData = copyFormData(validFormData)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await PATCH(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Test maximum length
      vi.clearAllMocks()
      vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
      vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)

      const longFormData = copyFormData(validFormData)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await PATCH(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del artículo es requerido')
  })

  it('should return an error if the id not in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('No hay ningún artículo con ese ID')
  })

  it('should return an error if the image is invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)

    const image = createMockImageFile(
      "text.txt",
      "text/plain",
      "this is not an image file"
    )

    const formData = copyFormData(validFormData)
    formData.set('thumbnail', image)

    const context = createValidContext(formData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("El archivo debe ser una imagen")
  })

  it('should return an error if the file is invalid', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)

    const file = createMockPDFFile(
      "text.txt",
      "text/plain",
      "this is not a pdf file"
    )

    const formData = copyFormData(validFormData)
    formData.set('file', file)

    const context = createValidContext(formData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("El archivo debe ser un PDF")
  })

  it('should return an error if the title is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce({
      ...mockArticles[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the file is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce({
      ...mockArticles[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El archivo ya está en uso')
  }) 

  it('should return an error if the thumbnail is already in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'getArticleByTitle').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByFileHash').mockResolvedValueOnce(null)
    vi.spyOn(ArticleRepository, 'getArticleByThumbnailHash').mockResolvedValueOnce({
      ...mockArticles[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el articulo")
  })
})

describe('DELETE /articles', async() => {
  const validFormData = new FormData()
  validFormData.append('id', '1')

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/articles', {
        method: 'DELETE',
        body: formData,
      })
    )
  }

  it('should delete an article', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(mockArticles[0])
    vi.spyOn(ArticleRepository, 'deleteArticleById').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Artículo eliminado correctamente')
  })

  it('should return an error if the FormData is not provided', async() => {
    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el artículo")
  })

  it('should return an error if the id is not provided', async() => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del artículo es requerido')
  })

  it('should return an error if the id not in use', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('No hay ningún artículo con ese ID')
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(ArticleRepository, 'getArticleById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el artículo")
  })
})