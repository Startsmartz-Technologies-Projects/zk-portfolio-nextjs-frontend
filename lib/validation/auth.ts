import { z } from 'zod'
import { PASSWORD_MIN_LENGTH, passwordPolicyErrors } from '@/lib/auth/password-policy'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .superRefine((pw, ctx) => {
      for (const message of passwordPolicyErrors(pw)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    }),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
