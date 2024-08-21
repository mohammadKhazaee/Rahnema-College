import { z } from 'zod';

export const createCommentDto = z.object({
    postId: z.string().uuid(),
    content: z.string(),
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;
