import { VideoController } from '@src/controllers/VideoController';
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return VideoController.getVideos(context);
}

export async function POST(context: APIContext): Promise<Response> {
  return VideoController.createVideo(context);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return VideoController.updateVideo(context);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return VideoController.deleteVideo(context);
}