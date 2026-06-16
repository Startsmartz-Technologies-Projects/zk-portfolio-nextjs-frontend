import { z } from 'zod'

export const createUserSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'editor']),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['admin', 'editor']),
    status: z.enum(['active', 'suspended']),
  })
  .partial()

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const listUsersSchema = z.object({
  q: z.string().optional(),
  role: z.enum(['admin', 'editor']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  includeDeleted: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
