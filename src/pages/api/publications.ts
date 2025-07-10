import { PublicationController } from '@src/controllers/PublicationController';
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return PublicationController.getPublications(context);
}

export async function POST(context: APIContext): Promise<Response> {
  return PublicationController.createPublication(context);
}

export async function PUT(context: APIContext): Promise<Response> {
  return PublicationController.updatePublication(context);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return PublicationController.deletePublication(context);
}