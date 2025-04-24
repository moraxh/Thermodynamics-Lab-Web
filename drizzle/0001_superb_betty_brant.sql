CREATE TABLE "article" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"authors" json NOT NULL,
	"description" text NOT NULL,
	"body" text NOT NULL,
	"thumbnail_path" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_title_unique" UNIQUE("title"),
	CONSTRAINT "article_description_unique" UNIQUE("description"),
	CONSTRAINT "article_body_unique" UNIQUE("body")
);
--> statement-breakpoint
CREATE TABLE "educational_material" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "educational_material_title_unique" UNIQUE("title"),
	CONSTRAINT "educational_material_description_unique" UNIQUE("description")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type_of_event" varchar(255) NOT NULL,
	"event_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text NOT NULL,
	"link" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_title_unique" UNIQUE("title"),
	CONSTRAINT "event_description_unique" UNIQUE("description")
);
--> statement-breakpoint
CREATE TABLE "video" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"duration_in_seconds" integer NOT NULL,
	"thumbnail_path" text,
	"video_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_title_unique" UNIQUE("title"),
	CONSTRAINT "video_description_unique" UNIQUE("description"),
	CONSTRAINT "video_video_path_unique" UNIQUE("video_path")
);
