import z from 'zod';

export const logindto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
        password: z.string().min(8, 'Please enter a valid password'),
        rememberMe: z.boolean(),
    })
    .or(
        z.object({
            email: z.string().email(),
            password: z.string().min(8, 'Should be more than 8 character'),
            rememberMe: z.boolean(),
        })
    );

export type LoginDto = z.infer<typeof logindto>;
