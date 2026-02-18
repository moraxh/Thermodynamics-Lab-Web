CREATE TABLE "infographics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_path" text NOT NULL,
	"categories" json NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "infographics_title_unique" UNIQUE("title"),
	CONSTRAINT "infographics_image_path_unique" UNIQUE("image_path")
);
