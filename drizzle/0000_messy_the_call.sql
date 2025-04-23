CREATE TYPE "public"."type" AS ENUM('article', 'book', 'thesis', 'technical_report', 'monograph', 'other');--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"photo" text,
	"type_of_member" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberType" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"plural_name" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "memberType_name_unique" UNIQUE("name"),
	CONSTRAINT "memberType_plural_name_unique" UNIQUE("plural_name"),
	CONSTRAINT "memberType_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "publication" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "type" DEFAULT 'other' NOT NULL,
	"authors" json NOT NULL,
	"publication_date" timestamp NOT NULL,
	"file_path" text NOT NULL,
	"thumbnail_path" text,
	CONSTRAINT "publication_title_unique" UNIQUE("title"),
	CONSTRAINT "publication_file_path_unique" UNIQUE("file_path"),
	CONSTRAINT "publication_thumbnail_path_unique" UNIQUE("thumbnail_path")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"fresh" boolean
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_type_of_member_memberType_name_fk" FOREIGN KEY ("type_of_member") REFERENCES "public"."memberType"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;