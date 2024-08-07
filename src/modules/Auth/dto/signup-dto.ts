import { z } from 'zod';

export const signupDto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'The passwords did not match',
                path: ['confirmPassword'],
            });
        }
    });

export type SignupDto = z.infer<typeof signupDto>;
