import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { GET } from "@api/videos"
import { VideoRepository } from '@src/repositories/VideoRepository';
import type { VideoSelect } from '@src/repositories/VideoRepository';
import { createMockContext } from '@__mocks__/utils';

vi.mock('@src/repositories/VideoRepository')

beforeEach(() => {
  vi.clearAllMocks()
})

const mockVideos: VideoSelect[] = [
  {
    id: '1',
    duration: 120,
    title: 'Video 1',
    description: 'Description 1',
    thumbnailPath: 'http://example.com/thumbnail1.jpg',
    videoPath: 'http://example.com/video1.mp4',
    uploadedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    duration: 150,
    title: 'Video 2',
    description: 'Description 2',
    thumbnailPath: 'http://example.com/thumbnail2.jpg',
    videoPath: 'http://example.com/video2.mp4',
    uploadedAt: new Date('2023-01-02'),
  }
]

describe('GET /videos', async () => {
  it('should return a list of videos without params', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockResolvedValue(mockVideos)
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockResolvedValue(mockVideos.length)

    const context = createMockContext(
      new Request('http://localhost:3000/videos')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.videos).toEqual(mockVideos.map(video => {
      return {
        ...video,
        uploadedAt: video.uploadedAt.toISOString(),
      }
    }))
  })

  it('should return a list of videos with params', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockResolvedValue([mockVideos[0]])
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockResolvedValue(1)

    const context = createMockContext(
      new Request('http://localhost:3000/videos&page=1&limit=1')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.videos).toEqual([{
      ...mockVideos[0],
      uploadedAt: mockVideos[0].uploadedAt.toISOString(), 
    }])
  })

  it('should return an empty list if there are not videos ', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockResolvedValue([])
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockResolvedValue(0)

    const context = createMockContext(
      new Request('http://localhost:3000/videos')
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.videos).toEqual([])
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockRejectedValueOnce(new Error('Error getting videos'))
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockRejectedValueOnce(new Error('Error getting videos'))

    const context = createMockContext(
      new Request('http://localhost:3000/videos')
    )

    const response = await GET(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al obtener los videos')
  })
})