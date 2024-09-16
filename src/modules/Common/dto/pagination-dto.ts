import { z } from 'zod';

export const paginationDto = z.object({
    p: z.coerce.number().min(1).default(1),
    c: z.coerce.number().min(1).default(10),
});

export type PaginationDto = z.infer<typeof paginationDto>;

export const searchDto = z.object({
    s: z.string(),
    p: z.coerce.number().min(1).default(1),
    c: z.coerce.number().min(1).default(10),
});

export type SearchDto = z.infer<typeof searchDto>;
