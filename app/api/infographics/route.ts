import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { infographics } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireAuth } from "@/lib/auth-utils";
import {
  parseFormData,
  handleFileUpload,
  createErrorResponse,
  createSuccessResponse,
  ALLOWED_FILE_TYPES,
} from "@/lib/upload";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let infographicsData;

    if (category && category !== "all") {
      // Filter by category - check if the category exists in the categories JSON array
      infographicsData = await db
        .select()
        .from(infographics)
        .where(sql`${infographics.categories}::jsonb ? ${category}`)
        .orderBy(infographics.uploadedAt);
    } else {
      infographicsData = await db
        .select()
        .from(infographics)
        .orderBy(infographics.uploadedAt);
    }

    return createSuccessResponse(infographicsData);
  } catch (error) {
    console.error("Error fetching infographics:", error);
    return createErrorResponse("Failed to fetch infographics", 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { title, description, categories } = fields;

    if (!title || !description || !categories) {
      return createErrorResponse(
        "Missing required fields: title, description, categories",
      );
    }

    if (!files.file) {
      return createErrorResponse("No image file provided");
    }

    // Parse categories from comma-separated string to array
    let categoriesArray: string[];
    try {
      categoriesArray = (categories as string)
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

      if (categoriesArray.length === 0) {
        return createErrorResponse("At least one category is required");
      }
    } catch {
      return createErrorResponse("Invalid categories format");
    }

    const { path: imagePath } = await handleFileUpload(files.file, {
      allowedTypes: ALLOWED_FILE_TYPES.images,
    });

    const infographicId = nanoid();
    const [newInfographic] = await db
      .insert(infographics)
      .values({
        id: infographicId,
        title: title as string,
        description: description as string,
        imagePath,
        categories: categoriesArray,
      })
      .returning();

    return createSuccessResponse(newInfographic, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create infographic";
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { id, title, description, categories } = fields;

    if (!id) {
      return createErrorResponse("Missing required field: id");
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (categories) {
      try {
        const categoriesArray = (categories as string)
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat.length > 0);

        if (categoriesArray.length > 0) {
          updateData.categories = categoriesArray;
        }
      } catch {
        return createErrorResponse("Invalid categories format");
      }
    }

    if (files.file) {
      const { path: imagePath } = await handleFileUpload(files.file, {
        allowedTypes: ALLOWED_FILE_TYPES.images,
      });
      updateData.imagePath = imagePath;
    }

    const [updated] = await db
      .update(infographics)
      .set(updateData)
      .where(eq(infographics.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse("Infographic not found", 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update infographic";
    return createErrorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return createErrorResponse("Missing required parameter: id");
    }

    await db.delete(infographics).where(eq(infographics.id, id));

    return createSuccessResponse({
      message: "Infographic deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete infographic";
    return createErrorResponse(message, 500);
  }
}
