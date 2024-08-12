import z from 'zod';

export const logindto = z
    .object({
        username: z.string().regex(/^[a-zA-Z0-9]{4,}/),
        password: z.string().min(8, 'Please enter a valid password'),
        rememberMe: z.boolean(),
    })
    .or(
        z.object({
            email: z.string().email(),
            password: z.string().min(8, 'Please enter a valid password'),
            rememberMe: z.boolean(),
        })
    );

export type LoginDto = z.infer<typeof logindto>;
