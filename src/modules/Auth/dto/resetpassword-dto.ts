import z from 'zod';

export const resetPasswordDto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
    })
    .or(
        z.object({
            email: z.string().email(),
        })
    );

export type ResetPaswordDto = z.infer<typeof resetPasswordDto>;
