import { generateIdFromEntropySize } from 'lucia'
import { MemberTypeRepository } from '../repositories/MemberTypeRepository'

export class MemberTypeService {
  static async clearData(): Promise<void> {
    await MemberTypeRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    const membersType = [
      { id: generateIdFromEntropySize(10), name: "Fundador", pluralName: "Fundadores",order: 1 },
      { id: generateIdFromEntropySize(10), name: "Colaborador", pluralName: "Colaboradores", order: 2 },
      { id: generateIdFromEntropySize(10), name: "Miembro", pluralName: "Miembros", order: 3 },
    ]

    await MemberTypeRepository.insertMemberTypes(membersType)
  }
}