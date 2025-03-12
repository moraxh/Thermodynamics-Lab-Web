import idleDirective from "astro/runtime/client/idle.js";
import { defineDb, defineTable, column } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    password_hash: column.text(),
  }
})

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true}),
    userId: column.text({ references: () => User.columns.id, optional: true }),
    expiresAt: column.text(),
    fresh: column.boolean({ optional: true })
  }
})

const MemberType = defineTable({
  columns: {
    name: column.text({ primaryKey: true, unique: true }),
    order: column.number({ unique: true })
  }
})

const Member = defineTable({
  columns: {
    id: column.text({ primaryKey: true}),
    fullName: column.text(),
    position: column.text({ optional: true }),
    photo: column.text({ optional: true }),
    typeOfMember: column.text({ references: () => MemberType.columns.name }),   
  }
})

export default defineDb({
  tables: {
    User,
    Session,
    Member,
    MemberType
  }
})