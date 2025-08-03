import { EducationalMaterialController } from '@src/controllers/EducationalMaterialController';
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return EducationalMaterialController.getEducationalMaterial(context);
}

export async function POST(context: APIContext): Promise<Response> {
  return EducationalMaterialController.createEducationalMaterial(context);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return EducationalMaterialController.deleteEducationalMaterial(context);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return EducationalMaterialController.updateEducationalMaterial(context);
} 