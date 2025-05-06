import { VideoController } from "@src/controllers/VideoController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return VideoController.getVideos(context);
}