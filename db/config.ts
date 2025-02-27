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

export default defineDb({
  tables: {
    User,
    Session
  }
})