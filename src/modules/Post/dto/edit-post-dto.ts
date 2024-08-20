import { z } from 'zod';
import { IFile, zodFileSchema } from '../../../utility/file-parser';

const editImagesDto = z.preprocess(
    (val) => JSON.parse(String(val)),
    z.object({ imageId: z.coerce.number(), url: z.string() })
);

export const editPostDto = z.object({
    postId: z.coerce.number(),
    caption: z.string().optional(),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)).optional(),
    deletedImages: z.array(editImagesDto).optional().default([]),
    images: z.array(zodFileSchema).optional(),
});

export type EditImagesDto = z.infer<typeof editImagesDto>;

export type EditPostDto = z.infer<typeof editPostDto>;
