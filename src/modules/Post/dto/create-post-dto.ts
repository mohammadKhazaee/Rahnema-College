import { z, ZodError } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';
import { CreatePostReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

export const createPostDto = z.object({
    caption: z.string().optional().default(''),
    images: z.array(zodFileSchema).min(1),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)).optional().default([]),
    isCloseFriend: z
        .string()
        .toLowerCase()
        .transform((x) => x === 'true')
        .pipe(z.boolean()),
});

export const createPostValidator = (input: any) => {
    try {
        return createPostDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: CreatePostReason;
            if ('caption' in formatedError) reason = CreatePostReason.InvalidCaption;
            if ('images' in formatedError) reason = CreatePostReason.InvalidImages;
            if ('mentions' in formatedError) reason = CreatePostReason.InvalidMentions;
            if ('isCloseFriend' in formatedError) reason = CreatePostReason.InvalidIsCloseFriend;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type CreatePostDto = z.infer<typeof createPostDto>;
