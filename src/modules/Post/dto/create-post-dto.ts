import { z } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';

export const createPostDto = z.object({
    caption: z.string().optional().default(''),
    images: z.array(zodFileSchema).min(1),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)).optional().default([]),
});

export type CreatePostDto = z.infer<typeof createPostDto>;
