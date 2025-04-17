import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const User = pgTable("user", {
  id: varchar("id", {
    length: 255
  }).primaryKey(),
  username: varchar("username", {
    length: 255
  }).unique().notNull(),
  passwordHash: text("password_hash").notNull()
})

export const Session = pgTable("session", {
  id: varchar("id", {
    length: 255
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 255
  }).notNull().references(() => User.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull(),
  fresh: boolean("fresh")
})

export const MemberType = pgTable("memberType", {
  name: varchar("name", {
    length: 255
  }).primaryKey(),
  pluralName: varchar("plural_name", {
    length: 255
  }).notNull(),
  order: integer("order").notNull()
})

export const Member = pgTable("member", {
  id: varchar("id", {
    length: 255
  }).primaryKey(),
  fullName: varchar("full_name", {
    length: 255
  }).notNull(),
  position: varchar("position", {
    length: 255
  }).notNull(),
  photo: text("photo"),
  typeOfMember: varchar("type_of_member", {
    length: 255
  }).notNull().references(() => MemberType.name)
})

export const Gallery = pgTable("gallery", {
  id: varchar("id", {
    length: 255
  }).primaryKey(),
  path: text("path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow()
})