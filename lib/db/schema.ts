import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  json,
  pgEnum,
  date,
  time,
} from "drizzle-orm/pg-core";

// Auth tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Members
export const members = pgTable("members", {
  id: varchar("id", { length: 255 }).primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  photo: text("photo"),
  typeOfMember: varchar("type_of_member", { length: 255 }).notNull(),
});

// Gallery
export const gallery = pgTable("gallery", {
  id: varchar("id", { length: 255 }).primaryKey(),
  path: text("path").notNull().unique(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});

// Publications
export const publicationTypeEnum = pgEnum("publication_type", [
  "article",
  "book",
  "thesis",
  "technical_report",
  "monograph",
  "other",
]);

export const publications = pgTable("publications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  type: publicationTypeEnum("type").notNull().default("other"),
  authors: json("authors").notNull().$type<string[]>(),
  publicationDate: timestamp("publication_date", { mode: "date" }).notNull(),
  filePath: text("file_path"),
  link: text("link"),
});

// Videos
export const videos = pgTable("videos", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  thumbnailPath: text("thumbnail_path"),
  videoPath: text("video_path").notNull().unique(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});

// Educational material
export const educationalMaterial = pgTable("educational_material", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  filePath: text("file_path").notNull().unique(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  typeOfEvent: varchar("type_of_event", { length: 255 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  location: text("location").notNull(),
  link: text("link"),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});

// Infographics
export const infographics = pgTable("infographics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  imagePath: text("image_path").notNull().unique(),
  categories: json("categories").notNull().$type<string[]>(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});
