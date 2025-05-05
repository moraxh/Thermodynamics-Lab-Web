import { describe, it, expect, vi, beforeEach, afterAll, afterEach } from 'vitest'
import { GET, POST, DELETE } from "@api/gallery"
import { GalleryRepository } from "@src/repositories/GalleryRepository"
import type { GallerySelect } from "@src/repositories/GalleryRepository"
import type { APIContext } from "astro"
import { createMockImageFile, createMockContext } from '@__mocks__/utils'
import { generateHashFromStream } from "@__mocks__/scripts/hash"

vi.mock('fs', () => import('@__mocks__/modules/fs'))
vi.mock('hash', () => import('@__mocks__/scripts/hash'))
vi.mock('@src/repositories/GalleryRepository')
vi.mock('@db/connection', () => ({
  db: {
    query: vi.fn()
  }
}))

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
  it('should return a list of images', async () => {
    vi.spyOn(GalleryRepository, 'getImages').mockResolvedValueOnce(mockImages)

    const url = new URL("http://localhost/api/gallery")
    const response = await GET({ url } as APIContext)

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

    const url = new URL("http://localhost/api/gallery")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.images).toEqual([])

    expect(GalleryRepository.getImages).toHaveBeenCalled()
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(GalleryRepository, 'getImages').mockRejectedValueOnce(new Error("Database error"))

    const url = new URL("http://localhost/api/gallery")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()

    expect(GalleryRepository.getImages).toHaveBeenCalled()
  })
})

describe('POST /gallery', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new image', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockResolvedValue(null)
    vi.spyOn(GalleryRepository, 'insertImages').mockResolvedValueOnce(undefined)
    
    const file = createMockImageFile()
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toEqual('Imagen creada correctamente')
  })

  it('should return an error if formdata is not provided', async () => {
    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo crear la imagen')
  })

  it('should return an error if the image is not provided', async () => {
    const formData = new FormData()

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('La imagen es requerida')
  })

  it('should return an error if the image is not an image', async () => {
    const file = createMockImageFile('no image.txt', 'text/plain', 'Hola')
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('El archivo no es una imagen')

  })

  it('should return an error if the image has an invalid format', async () => {
    const file = createMockImageFile('gif.gif', 'image/gif', 'Hola')
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('Formato de imagen no soportado')
  })

  it('should return an error if the image is too large', async () => {
    const file = createMockImageFile('image.png', 'image/png', 'H'.repeat(11 * 1024 * 1024)) // 11MB
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('La imagen es demasiado grande (10MB máximo)')
  })

  it('should return an error if the image already exists', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockResolvedValue(mockImages[0])
    vi.spyOn(GalleryRepository, 'insertImages').mockResolvedValueOnce(undefined)
    
    const file = createMockImageFile()
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('La imagen ya existe')
  })

  it('should return an error if something goes wrong', async () => {
    generateHashFromStream.mockResolvedValueOnce('mockedHash')
    vi.spyOn(GalleryRepository, 'findImageByHash').mockRejectedValue(new Error("Database error"))
    vi.spyOn(GalleryRepository, 'insertImages').mockRejectedValue(new Error("Database error"))
    
    const file = createMockImageFile()
    const formData = new FormData()
    formData.append('image', file)

    const context = createMockContext(
      new Request('http://localhost/api/gallery', {
        method: 'POST',
        body: formData,
      })
    )

    const response = await POST(context)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo crear la imagen')
  })
})

describe("DELETE /gallery", async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should delete an image", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const formData = new FormData()
    formData.append('id', '123')

    const context = createMockContext(
      new Request("http://localhost/api/gallery", {
        method: "DELETE",
        body: formData
      })
    )
    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toEqual('Imagen eliminada correctamente')
  })

  it("should return an error if formdata is not provided", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const context = createMockContext(
      new Request("http://localhost/api/gallery", {
        method: "DELETE",
      })
    )
    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo eliminar la imagen')
  })

  it("should return an error if the image id is not provided", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce("path/image1.png")

    const formData = new FormData()

    const context = createMockContext(
      new Request("http://localhost/api/gallery", {
        method: "DELETE",
        body: formData
      })
    )
    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('El ID de la imagen es requerido')
  })

  it("should return an error if the image id does not exist", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('id', '123')

    const context = createMockContext(
      new Request("http://localhost/api/gallery", {
        method: "DELETE",
        body: formData
      })
    )
    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toEqual('El ID de imagen no existe')
  })

  it("should return an error if something goes wrong", async () => {
    vi.spyOn(GalleryRepository, 'findImagePathById').mockRejectedValueOnce(new Error('Database Error'))

    const formData = new FormData()
    formData.append('id', '123')

    const context = createMockContext(
      new Request("http://localhost/api/gallery", {
        method: "DELETE",
        body: formData
      })
    )
    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toEqual('No se pudo eliminar la imagen')
  })
})