import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberRepository } from '@src/repositories/MemberRepository';
import { MemberTypeRepository } from '@src/repositories/MemberTypeRepository';
import type { MemberSelect } from '@src/repositories/MemberRepository';
import type { MemberTypeSelect } from '@src/repositories/MemberTypeRepository';
import { createMockContext, createMockImageFile } from '@__mocks__/utils';
import { GET, POST, DELETE } from '@api/members';

beforeEach(() => {
  vi.clearAllMocks()
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

describe('GET /members', async () => {
  it('should return a list of members', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockResolvedValueOnce(mockMembers)
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockResolvedValueOnce(mockMemberTypes)

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'GET',
      })
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(Object.keys(data.members).length).toBe(mockMembers.length)
  })

  it('should return an empty list if no members are found', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockResolvedValueOnce([])
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockResolvedValueOnce([])

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'GET',
      })
    )

    const response = await GET(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.members).toEqual({})
  })

  it('should return a error if something goes wrong', async () => {
    vi.spyOn(MemberRepository, 'getMembers').mockRejectedValueOnce(new Error('Error'))
    vi.spyOn(MemberTypeRepository, 'getMemberTypes').mockRejectedValueOnce(new Error('Error'))

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'GET',
      })
    )

    const response = await GET(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al obtener los miembros")
  })
})

describe('POST /members', async () => {
  it('should create a new member', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile()

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toEqual("Miembro creado correctamente")
  })

  it('should return an error if something goes wrong', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockRejectedValueOnce(new Error('Error'))
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockRejectedValueOnce(new Error('Error'))

    const file = createMockImageFile()

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al crear el miembro")
  })

  it('should return an error if the formdata is not provided', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al crear el miembro")
  })

  it('should return an error if the memberType is not correct', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(null)

    const file = createMockImageFile()

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Invalid Type')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El tipo de miembro no es válido")
  })

  it('should return an error if the image is not provided', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile()

    const formData = new FormData()
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("La imagen es requerida")
  })

  it('should return an error if the image is not an image', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile(
      "test.txt",
      'text/plain',
      'This is not an image'
    )

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El archivo no es una imagen")
  })

  it('should return an error if the image has an invalid format', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile(
      "test.gif",
      'image/gif',
      'This is a gif'
    )

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("Formato de imagen no soportado")
  })

  it('should return an error if the image has an invalid format', async() => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile(
      "test.png",
      'image/png',
      'H'.repeat(11 * 1024 * 1024) // 11MB
    )

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("La imagen es demasiado grande (10MB máximo)")
  })

  it('should return an error if any of the parameters is not provide', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile()

    const validFormData = new FormData()
    validFormData.append('memberPhoto', file)
    validFormData.append('fullName', 'John Doe')
    validFormData.append('position', 'Developer')
    validFormData.append('typeOfMember', 'Full Stack')

    const testLimits = [
      'fullName',
      'position',
      'typeOfMember',
    ]

    const ErrorMessages = {
      'fullName': "El nombre es requerido",
      'position': "La posición es requerida",
      'typeOfMember': "El tipo de miembro es requerido",
    }

    await Promise.all(testLimits.map(async (key) => {
      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }
      formData.delete(key)

      var context = createMockContext(
        new Request('http://localhost:3000/api/members', {
          method: 'POST',
          body: formData,
        })
      )

      var response = await POST(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toEqual(ErrorMessages[key as keyof typeof ErrorMessages])
    }))

  })

  it('should return an error if the parameters are not valid', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(null)
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile()

    const validFormData = new FormData()
    validFormData.append('memberPhoto', file)
    validFormData.append('fullName', 'John Doe')
    validFormData.append('position', 'Developer')
    validFormData.append('typeOfMember', 'Full Stack')

    const testLimits = {
      'fullName': [3, 255],
      'position': [3, 255],
      'typeOfMember': [3, 255],
    }

    const ErrorMessages = {
      'fullName': {
        min: "El nombre completo debe tener al menos 3 caracteres de longitud",
        max: "El nombre completo no puede tener mas de 255 caracteres de longitud"
      },
      'position': {
        min: "La posición debe tener al menos 3 caracteres de longitud",
        max: "La posición no puede tener mas de 255 caracteres de longitud"
      },
      'typeOfMember': {
        min: "El tipo de miembro debe tener al menos 3 caracteres de longitud",
        max: "El tipo de miembro no puede tener mas de 255 caracteres de longitud"
      }
    }

    await Promise.all(Object.keys(testLimits).map(async (key) => {
      const [min, max] = testLimits[key as keyof typeof testLimits]
    
      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }
      formData.set(key, 'A'.repeat(min - 1))
    
      var context = createMockContext(
        new Request('http://localhost:3000/api/members', {
          method: 'POST',
          body: formData,
        })
      )
    
      var response = await POST(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toEqual(ErrorMessages[key as keyof typeof ErrorMessages].min)

      var formData = new FormData()
      for (const [k, v] of validFormData.entries()) {
        formData.append(k, v);
      }
      formData.set(key, 'A'.repeat(max + 1))
    
      var context = createMockContext(
        new Request('http://localhost:3000/api/members', {
          method: 'POST',
          body: formData,
        })
      )
    
      var response = await POST(context)
      expect(response.status).toBe(400)
      var data = await response.json()
      expect(data.message).toEqual(ErrorMessages[key as keyof typeof ErrorMessages].max)
    }))
  })

  it('should return an error if the member already exists', async () => {
    vi.spyOn(MemberRepository, 'findMemberByHash').mockResolvedValueOnce(mockMembers[0])
    vi.spyOn(MemberTypeRepository, 'findMemberTypeByName').mockResolvedValueOnce(mockMemberTypes[0])

    const file = createMockImageFile()

    const formData = new FormData()
    formData.append('memberPhoto', file)
    formData.append('fullName', 'John Doe')
    formData.append('position', 'Developer')
    formData.append('typeOfMember', 'Full Stack')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'POST',
        body: formData,
      })
    )
    const response = await POST(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("La imagen ya está asignada a otro miembro")
  })
})

describe('DELETE /members', async () => {
  it('should delete a member', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const formData = new FormData()
    formData.append('id', '1')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'DELETE',
        body: formData,
      })
    )

    const response = await DELETE(context)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toEqual("Miembro eliminado correctamente")
  })

  it('should return an error if something goes wrong', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockRejectedValueOnce(new Error('Error'))
    vi.spyOn(MemberRepository, 'deleteMember').mockRejectedValueOnce(new Error('Error'))

    const formData = new FormData()
    formData.append('id', '1')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'DELETE',
        body: formData,
      })
    )

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al eliminar el miembro")
  })

  it('should return an error if formdata is not provided', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'DELETE',
      })
    )

    const response = await DELETE(context)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toEqual("Error al eliminar el miembro")
  })

  it('should return an error if the id is not provided', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce('path/to/image.jpg')

    const formData = new FormData()

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'DELETE',
        body: formData,
      })
    )

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El id es requerido")
  })

  it('should return an error if the member does not exist', async() => {
    vi.spyOn(MemberRepository, 'findMemberImagePathById').mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.append('id', '1')

    const context = createMockContext(
      new Request('http://localhost:3000/api/members', {
        method: 'DELETE',
        body: formData,
      })
    )

    const response = await DELETE(context)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toEqual("El id no coincide con ningún miembro")
  })
})