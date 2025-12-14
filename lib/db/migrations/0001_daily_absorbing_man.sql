ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "articles" CASCADE;--> statement-breakpoint
ALTER TABLE "publications" DROP CONSTRAINT "publications_file_path_unique";--> statement-breakpoint
ALTER TABLE "publications" DROP CONSTRAINT "publications_thumbnail_path_unique";--> statement-breakpoint
ALTER TABLE "publications" ALTER COLUMN "file_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "link" text;