import z from "zod"

export const resetpassworddto = z.object({
    username: z.string().regex(/[a-zA-Z0-9_]{4,}/)
}).or(z.object({
    email: z.string().email()
}))

export type ResetPaswordDto = z.infer<typeof resetpassworddto>
