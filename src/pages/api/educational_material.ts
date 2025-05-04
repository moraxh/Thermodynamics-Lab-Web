import { EducationalMaterialController } from "@src/controllers/EducationalMaterialController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return EducationalMaterialController.getEducationalMaterial(context);
}