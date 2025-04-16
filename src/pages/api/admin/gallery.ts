import fs from "node:fs"
import type { APIContext } from "astro";
import { GalleryController } from "@src/controllers/GalleryController";

export async function POST(context: APIContext):Promise<Response> {
  return GalleryController.createImage(context)
}

export async function DELETE(context: APIContext):Promise<Response> {
  return GalleryController.deleteImage(context)
}