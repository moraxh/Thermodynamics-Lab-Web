import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { copyFormData } from '@src/utils/formData';
import { createMockContext, createMockImageFile, createMockVideoFile } from '@__mocks__/utils';
import {
  DELETE,
  GET,
  PATCH,
  POST
  } from '@api/videos';
import { VideoRepository } from '@src/repositories/VideoRepository';
import type { VideoSelect } from '@src/repositories/VideoRepository';

vi.mock('fs', () => import('@__mocks__/modules/fs'))
vi.mock('@src/repositories/VideoRepository')
vi.mock('@src/utils/Hash', () => ({
  generateHashFromStream: vi.fn().mockResolvedValue('mocked-hash')
}))
vi.mock('lucia', () => ({
  generateIdFromEntropySize: vi.fn().mockReturnValue('mocked-id')
}))
vi.mock('node:crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('mocked-uuid')
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

const mockVideos: VideoSelect[] = [
  {
    id: '1',
    title: 'Video 1',
    description: 'Description 1',
    thumbnailPath: 'http://example.com/thumbnail1.jpg',
    videoPath: 'http://example.com/video1.mp4',
    uploadedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Video 2',
    description: 'Description 2',
    thumbnailPath: 'http://example.com/thumbnail2.jpg',
    videoPath: 'http://example.com/video2.mp4',
    uploadedAt: new Date('2023-01-02'),
  }
]

describe('GET /videos', async () => {
  const createValidContext = (url: string = "http://localhost/api/videos"): any => {
    return createMockContext(
      new Request(url)
    )
  }

  it('should return a list of videos without params', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockResolvedValue(mockVideos)
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockResolvedValue(mockVideos.length)

    const context = createValidContext()

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

    const context = createValidContext('http://localhost/api/videos?page=1&limit=1')

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

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.videos).toEqual([])
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(VideoRepository, 'getVideos').mockRejectedValueOnce(new Error('Error getting videos'))
    vi.spyOn(VideoRepository, 'getNumberOfVideos').mockRejectedValueOnce(new Error('Error getting videos'))

    const context = createValidContext()

    const response = await GET(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Error al obtener los videos')
  })
})


describe('POST /videos', async () => {
  const validFormDataWithFiles = new FormData()
  validFormDataWithFiles.append('title', 'Test Video')
  validFormDataWithFiles.append('description', 'Description of test video')
  validFormDataWithFiles.append('videoFile', createMockVideoFile())
  validFormDataWithFiles.append('thumbnail', createMockImageFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('title', 'Test Video URL')
  validFormDataWithUrl.append('description', 'Description of test video with URL')
  validFormDataWithUrl.append('videoUrl', 'https://example.com/video.mp4')

  const createValidContext = (formData: FormData | null = null): any => {
    return createMockContext(
      new Request('http://localhost/api/videos', {
        method: 'POST',
        body: formData,
      })
    )
  }

  it('should create a video with video file and thumbnail', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'createVideos').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithFiles)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Video creado correctamente')
  })

  it('should create a video with video URL', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'createVideos').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Video creado correctamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el video")
  })

  it('should return an error if required parameters are not provided', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

    const testCases = {
      title: "El título es requerido",
      description: "La descripción es requerida",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      const formData = copyFormData(validFormDataWithFiles)
      formData.delete(key)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe(errorMessage)
    }))
  })

  it('should return an error if parameters are invalid', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

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
      const shortFormData = copyFormData(validFormDataWithFiles)
      shortFormData.set(key, 'a'.repeat(info.limits.min - 1))

      const shortContext = createValidContext(shortFormData)
      const shortResponse = await POST(shortContext)
      expect(shortResponse.status).toBe(400)
      const shortData = await shortResponse.json()
      expect(shortData.message).toBe(info.errorMessages.min)

      // Test maximum length
      const longFormData = copyFormData(validFormDataWithFiles)
      longFormData.set(key, 'a'.repeat(info.limits.max + 1))

      const longContext = createValidContext(longFormData)
      const longResponse = await POST(longContext)
      expect(longResponse.status).toBe(400)
      const longData = await longResponse.json()
      expect(longData.message).toBe(info.errorMessages.max)
    }))
  })

  it('should return an error if neither video file nor video URL is provided', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('title', 'Test Video')
    formData.append('description', 'Description test')

    const context = createValidContext(formData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("Debe proporcionar un archivo de video o una URL de video")
  })

  it('should return an error if video file is provided without thumbnail', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('title', 'Test Video')
    formData.append('description', 'Description test')
    formData.append('videoFile', createMockVideoFile())

    const context = createValidContext(formData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe("Invalid input")
  })

  it('should return an error if the title is already in use', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(mockVideos[0])

    const context = createValidContext(validFormDataWithFiles)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the video file is already in use', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce(mockVideos[0])

    const context = createValidContext(validFormDataWithFiles)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El video ya está en uso')
  })

  it('should return an error if the thumbnail is already in use', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByThumbnailHash').mockResolvedValueOnce(mockVideos[0])

    const context = createValidContext(validFormDataWithFiles)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormDataWithFiles)

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al crear el video")
  })
})

describe('PATCH /videos', async () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')
  validFormData.append('title', 'Updated Video')
  validFormData.append('description', 'Updated description')
  validFormData.append('videoFile', createMockVideoFile())
  validFormData.append('thumbnail', createMockImageFile())

  const validFormDataWithUrl = new FormData()
  validFormDataWithUrl.append('id', '1')
  validFormDataWithUrl.append('title', 'Updated Video')
  validFormDataWithUrl.append('description', 'Updated description')
  validFormDataWithUrl.append('videoUrl', 'https://example.com/updated-video.mp4')

  const createValidContext = (formData: FormData | null = null): any => {
    return createMockContext(
      new Request('http://localhost/api/videos', {
        method: 'PATCH',
        body: formData,
      })
    )
  }

  it('should update a video', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByThumbnailHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'updateVideo').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Video actualizado correctamente')
  })

  it('should update a video with URL', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'updateVideo').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormDataWithUrl)

    const response = await PATCH(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Video actualizado correctamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el video")
  })

  it('should return an error if the id is not provided', async () => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del video es requerido')
  })

  it('should return an error if the video does not exist', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('El video no existe')
  })

  it('should return an error if the title is already in use by another video', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce({
      ...mockVideos[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El título ya está en uso')
  })

  it('should return an error if the video file is already in use by another video', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce({
      ...mockVideos[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El video ya está en uso')
  })

  it('should return an error if the thumbnail is already in use by another video', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByVideoHash').mockResolvedValueOnce(null)
    vi.spyOn(VideoRepository, 'getVideoByThumbnailHash').mockResolvedValueOnce({
      ...mockVideos[1],
      id: '2'
    })

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('La miniatura ya está en uso')
  })

  it('should return an error if parameters are invalid', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

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
      vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
      vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

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
      vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
      vi.spyOn(VideoRepository, 'getVideoByTitle').mockResolvedValueOnce(null)

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
    vi.spyOn(VideoRepository, 'getVideoById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await PATCH(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al actualizar el video")
  })
})

describe('DELETE /videos', async () => {
  const validFormData = new FormData()
  validFormData.append('id', '1')

  const createValidContext = (formData: FormData | null = null): any => {
    return createMockContext(
      new Request('http://localhost/api/videos', {
        method: 'DELETE',
        body: formData,
      })
    )
  }

  it('should delete a video', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(mockVideos[0])
    vi.spyOn(VideoRepository, 'deleteVideo').mockResolvedValueOnce(undefined)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Video eliminado correctamente')
  })

  it('should return an error if the FormData is not provided', async () => {
    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el video")
  })

  it('should return an error if the id is not provided', async () => {
    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('El ID del video es requerido')
  })

  it('should return an error if the video does not exist', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('El video no existe')
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(VideoRepository, 'getVideoById').mockRejectedValueOnce(new Error('Database error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe("Error al eliminar el video")
  })
})