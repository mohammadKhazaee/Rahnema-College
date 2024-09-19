import { z, ZodError } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';
import { UpdatePostReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

const editImagesDto = z.preprocess(
    (val) => JSON.parse(String(val)),
    z.object({ imageId: z.string(), url: z.string() })
);

export const editPostDto = z.object({
    postId: z.string().uuid(),
    caption: z.string(),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)),
    deletedImages: z.array(editImagesDto).optional().default([]),
    images: z.array(zodFileSchema).optional(),
    isCloseFriend: z.coerce.boolean(),
});

export const editPostValidator = (input: any) => {
    try {
        return editPostDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: UpdatePostReason;
            if ('postId' in formatedError) reason = UpdatePostReason.InvalidPostId;
            if ('caption' in formatedError) reason = UpdatePostReason.InvalidCaption;
            if ('mentions' in formatedError) reason = UpdatePostReason.InvalidMentions;
            if ('deletedImages' in formatedError) reason = UpdatePostReason.InvalidDeletedImages;
            if ('images' in formatedError) reason = UpdatePostReason.InvalidImages;
            if ('isCloseFriend' in formatedError) reason = UpdatePostReason.InvalidIsCloseFriend;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type EditImagesDto = z.infer<typeof editImagesDto>;

export type EditPostDto = z.infer<typeof editPostDto>;
