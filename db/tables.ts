import { pgTable, text, varchar, boolean, integer, timestamp, json, pgEnum, date, time } from "drizzle-orm/pg-core";
import { EndpointDidNotReturnAResponse } from "node_modules/astro/dist/core/errors/errors-data";

export const User = pgTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  username: varchar("username", { length: 255 })
    .unique()
    .notNull(),
  passwordHash: text("password_hash")
    .notNull()
})

export const Session = pgTable("session", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => User.id),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" })
    .notNull(),
  fresh: boolean("fresh")
})

export const MemberType = pgTable("memberType", {
  name: varchar("name", { length: 255 })
    .primaryKey()
    .unique(),
  pluralName: varchar("plural_name", { length: 255 })
    .notNull()
    .unique(),
  order: integer("order")
    .notNull()
    .unique()
})

export const Member = pgTable("member", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  fullName: varchar("full_name", { length: 255 })
    .notNull(),
  position: varchar("position", { length: 255 })
    .notNull(),
  photo: text("photo"),
  typeOfMember: varchar("type_of_member", { length: 255 })
    .notNull()
    .references(() => MemberType.name)
})

export const Gallery = pgTable("gallery", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  path: text("path")
    .notNull()
    .unique(),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})

export const publicationTypeEnum = pgEnum("type", ["article", "book", "thesis", "technical_report", "monograph", "other"]);

export const Publication = pgTable("publication", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull(),
  type: publicationTypeEnum()
    .notNull()
    .default("other"),
  authors: json("authors")
    .notNull(),
  publicationDate: timestamp("publication_date")
    .notNull(),
  filePath: text("file_path")
    .notNull()
    .unique(),
  thumbnailPath: text("thumbnail_path")
    .unique()
})

export const Video = pgTable("video", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull()
    .unique(),
  duration: integer("duration_in_seconds")
    .notNull(),
  thumbnailPath: text("thumbnail_path"),
  videoPath: text("video_path")
    .notNull()
    .unique(),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})

export const Article = pgTable("article", {
  id: varchar("id", { length: 255})
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  slug: text("slug")
    .notNull()
    .unique(),
  category: varchar("category", { length: 255 })
    .notNull(),
  authors: json("authors")
    .notNull(),
  description: text("description")
    .notNull()
    .unique(),
  body: text("body")
    .notNull()
    .unique(),
  thumbnailPath: text("thumbnail_path"),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})

export const EducationalMaterial = pgTable("educational_material", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull()
    .unique(),
  filePath: text("file_path")
    .notNull()
    .unique(),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})

export const Event = pgTable("event", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull()
    .unique(),
  typeOfEvent: varchar("type_of_event", { length: 255 })
    .notNull(),
  eventDate: date("event_date")
    .notNull(),
  startTime: time("start_time")
    .notNull(),
  endTime: time("end_time")
    .notNull(),
  location: text("location")
    .notNull(),
  link: text("link"),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})