import { z } from "zod"

export const UserSchema = z.object({
  username: z.string({ message: "Username is required"})
    .min(3, { message: "Username must be at least 3 characters long"})
    .max(20, { message: "Username must be at most 20 characters long"}),
  
  password: z.string({ message: "Password is required"})
    .min(5, { message: "Password must be at least 5 characters long"})
    .max(20, { message: "Password must be at most 20 characters long"}),
})
