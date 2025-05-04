import { describe, it, expect, vi } from 'vitest'
import { GET } from "@api/gallery"
import { GalleryRepository } from "@src/repositories/GalleryRepository"
import type { GallerySelect } from "@src/repositories/GalleryRepository"
import type { APIContext } from "astro"

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
  }]

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