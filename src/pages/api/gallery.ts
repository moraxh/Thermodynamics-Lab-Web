import { GalleryController } from "@src/controllers/GalleryController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return GalleryController.getImages(context)
}

export async function POST(context: APIContext):Promise<Response> {
  return GalleryController.createImage(context)
}

export async function DELETE(context: APIContext):Promise<Response> {
  return GalleryController.deleteImage(context)
}