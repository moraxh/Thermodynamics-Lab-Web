import { ResourceController } from "@src/controllers/ResourceController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return ResourceController.getResources(context);
}