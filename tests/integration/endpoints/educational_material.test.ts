import { describe, it, expect, vi } from 'vitest'
import { GET } from "@api/educational_material"
import { EducationalMaterialRepository } from "@src/repositories/EducationalMaterialRepository"
import type { EducationalMaterialSelect } from "@src/repositories/EducationalMaterialRepository"
import type { APIContext } from 'astro'

vi.mock('@src/repositories/EducationalMaterialRepository')
vi.mock('@db/connection', () => ({
  db: {
    query: vi.fn()
  }
}))

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
  it('should return a list of educational materials without params', async () => {
    vi.spyOn(EducationalMaterialRepository, 'getEducationalMaterial').mockResolvedValueOnce(mockEducationalMaterials)

    const url = new URL("http://localhost/api/educational_material")
    const response = await GET({ url } as APIContext)

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

    const url = new URL("http://localhost/api/educational_material")
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', limit.toString())

    const response = await GET({ url } as APIContext)

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

    const url = new URL("http://localhost/api/educational_material")
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', limit.toString())

    const response = await GET({ url } as APIContext)

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

    const url = new URL("http://localhost/api/educational_material")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()
  })
})
