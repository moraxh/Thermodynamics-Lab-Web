import { describe, it, expect, vi } from 'vitest';
import { GET } from "@api/articles"
import { ArticleRepository } from '@src/repositories/ArticleRepository';
import type { ArticleSelect } from '@src/repositories/ArticleRepository';
import type { APIContext } from 'astro';

vi.mock('@src/repositories/ArticleRepository')
vi.mock('@db/connection', () => ({
  db: {
    query: vi.fn()
  }
}))

const mockArticles: ArticleSelect[] = [
  {
    id: '1',
    title: 'Article 1',
    description: 'Description of article 1',
    publicationDate: new Date('2023-01-01'),  
    filePath: 'path/to/file1.pdf',
    thumbnailPath: 'path/to/thumbnail1.jpg',
  },
  {
    id: '2',
    title: 'Article 2',
    description: 'Description of article 2',
    publicationDate: new Date('2023-01-02'),  
    filePath: 'path/to/file2.pdf',
    thumbnailPath: 'path/to/thumbnail2.jpg',
  }
]

describe('GET /articles', async () => {
  it('should return a list of articles without params', async () => {
    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce(mockArticles)

    const url = new URL("http://localhost/api/articles")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.info).toBeDefined()
    expect(body.articles).toEqual(
      mockArticles.map(article => ({
        ...article,
        publicationDate: new Date(article.publicationDate).toISOString()
      }))
    )

    expect(ArticleRepository.getArticles).toHaveBeenCalled()
  })

  it('should return a list of articles with params', async () => {
    const page = 1
    const limit = 5
    const total = 10

    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce(mockArticles)
    vi.spyOn(ArticleRepository, 'getNumberOfArticles').mockResolvedValueOnce(total)

    const url = new URL(`http://localhost/api/articles?page=${page}&limit=${limit}`)
    const response = await GET({ url } as APIContext)

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

    expect(ArticleRepository.getArticles).toHaveBeenCalledWith(page, limit)
  })

  it('should return an empty list of articles if no articles are found', async () => {
    const page = 1
    const limit = 5
    const total = 0

    vi.spyOn(ArticleRepository, 'getArticles').mockResolvedValueOnce([])
    vi.spyOn(ArticleRepository, 'getNumberOfArticles').mockResolvedValueOnce(total)

    const url = new URL(`http://localhost/api/articles`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', limit.toString())

    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(200)
    const body = await response.json()  
    expect(body.info).toBeDefined()
    expect(body.info.page).toBe(page)
    expect(body.info.limit).toBe(limit)
    expect(body.info.total).toBe(total)
    expect(body.articles).toEqual([])
  })

  it('should return an error if something goes wrong on the repository', async () => {
    vi.spyOn(ArticleRepository, 'getArticles').mockRejectedValueOnce(new Error('Database error'))

    const url = new URL("http://localhost/api/articles")
    const response = await GET({ url } as APIContext)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBeDefined()
  })
})