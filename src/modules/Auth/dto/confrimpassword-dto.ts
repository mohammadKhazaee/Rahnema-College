import z from "zod"

export const confirmpassworddto = z.object({
    newPassword: z.string().min(8, "Please enter a valid password"),
    confirmPassword: z.string().min(8, "Please enter a valid password"),
}).refine((data) => data.newPassword !== data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
})

export type ConfirmPasswordDto = z.infer<typeof confirmpassworddto>