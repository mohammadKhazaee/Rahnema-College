import { z } from 'zod';

export const editProfileDto = z
    .object({
        email: z.string().email(),
        password: z.string().min(8).optional(),
        confirmPassword: z.string().min(8).optional(),
        fName: z
            .string()
            .min(3)
            .regex(/^[a-zA-Z]+$/)
            .optional(),
        lName: z
            .string()
            .min(3)
            .regex(/^[a-zA-Z]+$/)
            .optional(),
        imageUrl: z.string().optional(),
        bio: z.string().optional(),
        isPrivate: z.boolean(),
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

export type EditProfileDto = z.infer<typeof editProfileDto>;
