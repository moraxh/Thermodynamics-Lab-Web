ALTER TABLE "article" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN "category" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "educational_material" ADD COLUMN "file_path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "educational_material" ADD CONSTRAINT "educational_material_file_path_unique" UNIQUE("file_path");