import {
  boolean,
  date,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  varchar
  } from 'drizzle-orm/pg-core';

export const User = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  username: varchar("username", { length: 255 })
    .unique()
    .notNull(),
  passwordHash: text("password_hash")
    .notNull()
})

export const Session = pgTable("sessions", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => User.id),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" })
    .notNull(),
  fresh: boolean("fresh")
})

export const MemberType = pgTable("member_types", {
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

export const Member = pgTable("members", {
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

export const Publication = pgTable("publications", {
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

export const Video = pgTable("videos", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull()
    .unique(),
  thumbnailPath: text("thumbnail_path"),
  videoPath: text("video_path")
    .notNull()
    .unique(),
  uploadedAt: timestamp("uploaded_at")
    .notNull()
    .defaultNow()
})

export const Article = pgTable("articles", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull()
    .unique(),
  description: text("description")
    .notNull(),
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

export const Event = pgTable("events", {
  id: varchar("id", { length: 255 })
    .primaryKey(),
  title: text("title")
    .notNull(),
  description: text("description")
    .notNull(),
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