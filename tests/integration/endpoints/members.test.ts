import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberRepository } from '@src/repositories/MemberRepository';
import { MemberTypeRepository } from '@src/repositories/MemberTypeRepository';
import type { MemberSelect } from '@src/repositories/MemberRepository';
import type { MemberTypeSelect } from '@src/repositories/MemberTypeRepository';
import { createMockContext, createMockImageFile } from '@__mocks__/utils';
import { GET, POST, DELETE } from '@api/members';
import { copyFormData } from '@src/utils/formData';
import { fromRoutingStrategy } from 'node_modules/astro/dist/i18n/utils';

beforeEach(() => {
  vi.restoreAllMocks()
})

vi.mock('fs', () => import('@__mocks__/modules/fs'));
vi.mock('@src/repositories/MemberRepository')
vi.mock('@src/repositories/MemberTypeRepository')

const mockMemberTypes: MemberTypeSelect[] = [
  {
    name: 'Full Stack',
    pluralName: 'Full Stack',
    order: 1,
  },
  {
    name: 'UI/UX',
    pluralName: 'UI/UX',
    order: 2,
  },
]

const mockMembers: MemberSelect[] = [
  {
    id: '1',
    fullName: 'John Doe',
    position: 'Developer',
    typeOfMember: 'Full Stack',
    photo: 'john_doe.jpg',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    position: 'Designer',
    typeOfMember: 'UI/UX',
    photo: 'jane_smith.jpg',
  }
]

const uri = 'http://localhost:3000/api/members'

describe('GET /members', async () => {
  const validContext = createMockContext(
    new Request(uri, {
      method: 'GET',
    })
  )

  it('should return a list of members', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockResolvedValueOnce(mockMembers)
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockResolvedValueOnce(mockMemberTypes)

    const response = await GET(validContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(Object.keys(data.members).length).toBe(mockMembers.length)
  })

  it('should return an empty list if no members are found', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockResolvedValueOnce([])
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockResolvedValueOnce([])

    const response = await GET(validContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.members).toEqual({})
  })

  it('should return a error if something goes wrong', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockRejectedValueOnce(new Error('Error'))
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockRejectedValueOnce(new Error('Error'))

    const response = await GET(validContext)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al obtener los miembros")
  })
})

describe('POST /members', async () => {
  const validFormData = new FormData()
  validFormData.append('fullName', 'John Doe')
  validFormData.append('typeOfMember', 'Full Stack')
  validFormData.append('position', 'Developer')
  validFormData.append('memberPhoto', createMockImageFile())
  
  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request(uri, {
        method: 'POST',
        body: formData,
      })
    )
  }

  it('should create a new member', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toEqual("Miembro creado correctamente")
  })

  it('should return an error if the formdata is not provided', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const context = createValidContext()

    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al crear el miembro")
  })

  it('should return an error if the memberType is not correct', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El tipo de miembro no es válido")
  })

  it('should return an error if the image is invalid', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    // No image provided
    await (async() => {
      const formData = copyFormData(validFormData)
      formData.delete('memberPhoto')

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
      formData.set('memberPhoto', invalidFile)

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
      formData.set('memberPhoto', noSupportedFile)

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
      formData.set('memberPhoto', tooLargeFile)

      const context = createValidContext(formData)

      const response = await POST(context)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toEqual("El tamaño de la imagen no puede ser mayor a 10MB")
    })()
  })

  it('should return an error if any of the parameters are not provided', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const testCases = {
      'fullName': "El nombre completo es requerido",
      'position': "La posición del miembro es requerida",
      'typeOfMember': "El tipo de miembro es requerido",
    }

    await Promise.all(Object.entries(testCases).map(async ([key, errorMessage]) => {
      const formData = copyFormData(validFormData)
      formData.delete(key)

      const context = createValidContext(formData)

      var response = await POST(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toEqual(errorMessage)
    }))

  })

  it('should return an error if the parameters are not valid', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const testLimits = {
      'fullName': {
        "limits": [3, 255],
        "errorMessages": {
          "min": "El nombre completo debe tener al menos 3 caracteres de longitud",
          "max": "El nombre completo no puede tener mas de 255 caracteres de longitud"
        }
      },
      'position': {
        "limits": [3, 255],
        "errorMessages": {
          "min": "La posición debe tener al menos 3 caracteres de longitud",
          "max": "La posición no puede tener mas de 255 caracteres de longitud"
        }
      },
      'typeOfMember': {
        "limits": [3, 255],
        "errorMessages": {
          "min": "El tipo de miembro debe tener al menos 3 caracteres de longitud",
          "max": "El tipo de miembro no puede tener mas de 255 caracteres de longitud"
        }
      },
    }

    await Promise.all(Object.entries(testLimits).map(async ([key, info]) => {
      const [min, max] = info.limits
    
      // Min
      await (async () => {
        const formData = copyFormData(validFormData)
        formData.set(key, 'A'.repeat(min - 1))

        const context = createValidContext(formData)
    
        var response = await POST(context)
        expect(response.status).toBe(400)
        var data = await response.json()
        expect(data.message).toEqual(info.errorMessages.min)
      })()

      // Max
      await (async () => {
        const formData = copyFormData(validFormData)
        formData.set(key, 'A'.repeat(max + 1))

        const context = createValidContext(formData)
    
        var response = await POST(context)
        expect(response.status).toBe(400)
        var data = await response.json()
        expect(data.message).toEqual(info.errorMessages.max)
      })()
    }))
  })

  it('should return an error if the member already exists', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(mockMembers[0])
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const context = createValidContext(validFormData)

    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("La imagen ya está asignada a otro miembro")
  })
})

describe('PATCH /members', async() => {})

describe('DELETE /members', async () => {
  const validFormData = new FormData()  
  validFormData.append('id', '1')

  const createValidContext = (formData: FormData | null = null) => {
    return createMockContext(
      new Request(uri, {
        method: 'DELETE',
        body: formData,
      })
    )
  }
  
  it('should delete a member', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toEqual("Miembro eliminado correctamente")
  })

  it('should return an error if FormData is not provided', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const context = createValidContext()

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al eliminar el miembro")
  })

  it('should return an error if the id is not provided', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const formData = copyFormData(validFormData)
    formData.delete('id')

    const context = createValidContext(formData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El id es requerido")
  })

  it('should return an error if the member does not exist', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce(null)

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El id no coincide con ningún miembro")
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockRejectedValueOnce(new Error('Error'))
    vi.spyOn(MemberRepository, 'deleteMember').mockRejectedValueOnce(new Error('Error'))

    const context = createValidContext(validFormData)

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al eliminar el miembro")
  })
})