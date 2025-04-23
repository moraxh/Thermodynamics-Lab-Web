import { PublicationController } from "@src/controllers/PublicationController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return PublicationController.getPublications(context);
}