import z from 'zod';

export const confirmpassworddto = z
    .object({
        newPassword: z.string().min(8, 'Should be more than 8 character'),
        confirmPassword: z.string().min(8, 'Should be more than 8 character'),
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
