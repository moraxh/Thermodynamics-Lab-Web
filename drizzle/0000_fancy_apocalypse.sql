CREATE TYPE "public"."type" AS ENUM('article', 'book', 'thesis', 'technical_report', 'monograph', 'other');--> statement-breakpoint
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
	CONSTRAINT "educational_material_description_unique" UNIQUE("description"),
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
CREATE TABLE "member_types" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"plural_name" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "member_types_name_unique" UNIQUE("name"),
	CONSTRAINT "member_types_plural_name_unique" UNIQUE("plural_name"),
	CONSTRAINT "member_types_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "type" DEFAULT 'other' NOT NULL,
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
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"fresh" boolean
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
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
	CONSTRAINT "videos_description_unique" UNIQUE("description"),
	CONSTRAINT "videos_video_path_unique" UNIQUE("video_path")
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_type_of_member_member_types_name_fk" FOREIGN KEY ("type_of_member") REFERENCES "public"."member_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;