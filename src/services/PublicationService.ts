import { PublicationRepository } from "@src/repositories/PublicationRepository";
import { Publication } from "@db/tables";

type PublicationSelect = typeof Publication.$inferSelect

interface PublicationResponse {
  status: number;
  message?: string;
  info?: {
    total: number; 
    page: number; 
    size: number; 
    limit: number;
  },
  publications?: PublicationSelect[];
}

export class PublicationService {
  static async getPublications(searchParams: URLSearchParams): Promise<PublicationResponse> {
    // Check if there is pagination 
    const page = Number(searchParams.get('page')) || 1;
    // Check if there is a type filter
    const type = searchParams.get('type') as string || 'all';
    // Check if there is a size limit
    const limit = Number(searchParams.get('limit')) || 9;

    // Get the publication from the database with pagination and filter
    const publications = await PublicationRepository.getPublications(page, type, limit);
    const total = await PublicationRepository.getNumberOfPublications(type)

    return {
      status: 200,
      info: {
        total,
        page,
        size: publications.length,
        limit
      },
      publications
    }
  }
}