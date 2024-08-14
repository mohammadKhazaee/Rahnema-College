import { z } from 'zod';

export const createPostDto = z.object({
    caption: z.string(),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)),
});

export type CreatePostDto = z.infer<typeof createPostDto>;
