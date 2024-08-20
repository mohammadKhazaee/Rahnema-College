import { z } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';

const editImagesDto = z.preprocess(
    (val) => JSON.parse(String(val)),
    z.object({ imageId: z.string(), url: z.string() })
);

export const editPostDto = z.object({
    postId: z.string(),
    caption: z.string().optional(),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)).optional(),
    deletedImages: z.array(editImagesDto).optional().default([]),
    images: z.array(zodFileSchema).optional(),
});

export type EditImagesDto = z.infer<typeof editImagesDto>;

export type EditPostDto = z.infer<typeof editPostDto>;
