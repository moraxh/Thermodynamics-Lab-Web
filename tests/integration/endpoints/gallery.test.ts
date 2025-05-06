import { describe, it, expect, vi, beforeEach, afterAll, afterEach } from 'vitest'
import { GET, POST, DELETE } from "@api/gallery"
import { GalleryRepository } from "@src/repositories/GalleryRepository"
import type { GallerySelect } from "@src/repositories/GalleryRepository"
import type { APIContext } from "astro"
import { createMockImageFile, createMockContext } from '@__mocks__/utils'
import { generateHashFromStream } from "@__mocks__/scripts/hash"
import { copyFormData } from '@src/utils/formData'

vi.mock('fs', () => import('@__mocks__/modules/fs'))
vi.mock('hash', () => import('@__mocks__/scripts/hash'))
vi.mock('@src/repositories/GalleryRepository')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockImages: GallerySelect[] = [
  {
    id: '1',
    path: 'path/to/image1.jpg',
    uploadedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    path: 'path/to/image2.jpg',
    uploadedAt: new Date('2023-01-02')
  }
]

describe('GET /gallery', async () => {
  const createValidContext = (): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'GET',
      })
    )
  }

  it('should return a list of images', async () => {
    vi.spyOn(GalleryRepository, 'getImages').mockResolvedValueOnce(mockImages)

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.images).toEqual(
      mockImages.map(image => ({
        ...image,
        uploadedAt: new Date(image.uploadedAt).toISOString()
      }))
    )

    expect(GalleryRepository.getImages).toHaveBeenCalled()
  })

  it('should return an empty list of images', async () => {
    vi.spyOn(GalleryRepository, 'getImages').mockResolvedValueOnce([])

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.images).toEqual([])

    expect(GalleryRepository.getImages).toHaveBeenCalled()
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(GalleryRepository, 'getImages').mockRejectedValueOnce(new Error("Database error"))

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()

    expect(GalleryRepository.getImages).toHaveBeenCalled()
  })
})

describe('POST /gallery', async () => {
  const validFormData = new FormData()
  validFormData.append('image', createMockImageFile())

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData
      })
    )
  }

  it('should create a new image', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockResolvedValue(null)
    vi.spyOn(GalleryRepository, 'insertImages').mockResolvedValueOnce(undefined)
    
    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toEqual('Imagen creada correctamente')
  })

  it('should return an error if FormData is not provided', async () => {
    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo crear la imagen')
  })

  it('should return an error if the image is not valid', async () => {
    // No image provided
    await (async() => {
      const formData = copyFormData(validFormData)
      formData.delete('image')

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toEqual("La imagen es requerida")
    })()

    // Invalid file type
    await (async() => {
      const invalidFile = createMockImageFile(
        "test.txt",
        'text/plain',
        'This is not an image'
      ) 
      
      const formData = copyFormData(validFormData)
      formData.set('image', invalidFile)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toEqual("El archivo debe ser una imagen")
    })()

    // No supported format
    await (async() => {
      const noSupportedFile = createMockImageFile(
        "test.gif",
        'image/gif',
        'This is a gif'
      ) 
      
      const formData = copyFormData(validFormData)
      formData.set('image', noSupportedFile)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toEqual("Formato de imagen no soportado")
    })()

    // Too large image
    await (async() => {
      const tooLargeFile = createMockImageFile(
        "test.png",
        'image/png',
        'H'.repeat(20 * 1024 * 1024) // 20MB
      ) 
      
      const formData = copyFormData(validFormData)
      formData.set('image', tooLargeFile)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toEqual("El tamaño de la imagen no puede ser mayor a 10MB")
    })()
  })

  it('should return an error if the image already exists', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockResolvedValue(mockImages[0])
    vi.spyOn(GalleryRepository, 'insertImages').mockResolvedValueOnce(undefined)
    
    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('La imagen ya existe')
  })

  it('should return an error if something goes wrong', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockRejectedValue(new Error("Database error"))
    vi.spyOn(GalleryRepository, 'insertImages').mockRejectedValue(new Error("Database error"))
    
    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo crear la imagen')
  })
})

describe("DELETE /gallery", async () => {
  const validFormData = new FormData()
  validFormData.append('id', '123')

  const createValidContext = (formData: FormData | null = null): APIContext => {
    return createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'DELETE',
        body: formData
      })
    )
  }

  it("should delete an image", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toEqual('Imagen eliminada correctamente')
  })

  it("should return an error if FormData is not provided", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo eliminar la imagen')
  })

  it("should return an error if the image id is not provided", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('El ID de la imagen es requerido')
  })

  it("should return an error if the image id does not exist", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('El ID de imagen no existe')
  })

  it("should return an error if something goes wrong", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockRejectedValueOnce(new Error('Database Error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo eliminar la imagen')
  })
})