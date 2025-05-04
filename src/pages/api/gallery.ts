import { GalleryController } from "@src/controllers/GalleryController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return GalleryController.getImages(context)
}