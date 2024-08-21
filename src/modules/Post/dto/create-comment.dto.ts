import { z } from 'zod';

export const createCommentDto = z.discriminatedUnion('type', [
    z.object({
        postId: z.string().uuid(),
        type: z.literal('comment'),
        content: z.string(),
    }),
    z.object({
        postId: z.string().uuid(),
        type: z.literal('replay'),
        content: z.string(),
        parentId: z.string(),
    }),
]);

export type CreateCommentDto = z.infer<typeof createCommentDto>;
