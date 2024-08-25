import { z } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';

export const editProfileDto = z
    .object({
        email: z.string().email(),
        password: z.string().min(8).optional(),
        confirmPassword: z.string().min(8).optional(),
        image: zodFileSchema.optional(),
        fName: z.string().min(3),
        lName: z.string().min(3),
        bio: z.string(),
        isPrivate: z.coerce.boolean(),
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
