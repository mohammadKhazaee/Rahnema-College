import { z } from 'zod';

export const followListDto = z.object({
    p: z.coerce.number().min(1).default(1),
    c: z.coerce.number().min(1).default(10),
});

export type FollowListDto = z.infer<typeof followListDto>;
