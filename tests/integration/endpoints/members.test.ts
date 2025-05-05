import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberRepository } from '@src/repositories/MemberRepository';
import { MemberTypeRepository } from '@src/repositories/MemberTypeRepository';
import type { MemberSelect } from '@src/repositories/MemberRepository';
import type { MemberTypeSelect } from '@src/repositories/MemberTypeRepository';
import { createMockContext } from '@__mocks__/utils';
import { GET } from '@api/members';
import { mock } from 'node:test';

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
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
  it('should create a new member', async () => {})
  it('should return an error if something goes wrong', async () => {})
  it('should return an error if the formdata is not provided')
  it('should return an error if the image is not provided', async() => {})
  it('should return an error if the image is not an image', async() => {})
  it('should return an error if the image has an invalid format')
  it('should return an error if the image is too large', async() => {})
  it('should return an error if the image already exists', async() => {}) 
  it('should return an error if the image has an invalid format', async() => {})
  it('should return an error if any of the parameters is not provide', async () => {})
  it('should return an error if the parameters are not valid', async () => {})
  it('should return an error if the member already exists', async () => {})
})

describe('DELETE /members', async () => {
  it('should delete a member', async() => {})
  it('should return an error if something goes wrong', async() => {})
  it('should return an error if formdata is not provided', async() => {})
  it('should return an error if the id is not provided', async() => {})
  it('should return an error if the member does not exist', async() => {})
})