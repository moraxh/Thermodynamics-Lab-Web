import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from "@api/publications"
import { PublicationRepository } from '@src/repositories/PublicationRepository';
import type { PublicationSelect } from '@src/repositories/PublicationRepository';
import { createMockContext } from '@__mocks__/utils';

vi.mock('@src/repositories/PublicationRepository')

beforeEach(() => {
  vi.clearAllMocks()
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