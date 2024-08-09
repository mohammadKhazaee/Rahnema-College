import z from 'zod';

export const confirmpassworddto = z
    .object({
        newPassword: z.string().min(8, 'Please enter a valid password'),
        confirmPassword: z.string().min(8, 'Please enter a valid password'),
    })
    .superRefine(({ confirmPassword, newPassword }, ctx) => {
        if (confirmPassword !== newPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'The passwords did not match',
                path: ['confirmPassword'],
            });
        }
    });

export type ConfirmPasswordDto = z.infer<typeof confirmpassworddto>;
