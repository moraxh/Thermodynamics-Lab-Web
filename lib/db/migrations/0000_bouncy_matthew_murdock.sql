CREATE TYPE "public"."publication_type" AS ENUM('article', 'book', 'thesis', 'technical_report', 'monograph', 'other');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"authors" json NOT NULL,
	"publication_date" timestamp NOT NULL,
	"file_path" text NOT NULL,
	"thumbnail_path" text,
	CONSTRAINT "articles_title_unique" UNIQUE("title"),
	CONSTRAINT "articles_file_path_unique" UNIQUE("file_path"),
	CONSTRAINT "articles_thumbnail_path_unique" UNIQUE("thumbnail_path")
);
--> statement-breakpoint
CREATE TABLE "educational_material" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "educational_material_title_unique" UNIQUE("title"),
	CONSTRAINT "educational_material_file_path_unique" UNIQUE("file_path")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type_of_event" varchar(255) NOT NULL,
	"event_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text NOT NULL,
	"link" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"photo" text,
	"type_of_member" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "publication_type" DEFAULT 'other' NOT NULL,
	"authors" json NOT NULL,
	"publication_date" timestamp NOT NULL,
	"file_path" text NOT NULL,
	"thumbnail_path" text,
	CONSTRAINT "publications_title_unique" UNIQUE("title"),
	CONSTRAINT "publications_file_path_unique" UNIQUE("file_path"),
	CONSTRAINT "publications_thumbnail_path_unique" UNIQUE("thumbnail_path")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail_path" text,
	"video_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_title_unique" UNIQUE("title"),
	CONSTRAINT "videos_video_path_unique" UNIQUE("video_path")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;