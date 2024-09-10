import z from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';

export const createMessageDto = z
    .object({
        content: z.string(),
    })
    .or(
        z.object({
            image: zodFileSchema,
        })
    );

export type CreateMessageDto = z.infer<typeof createMessageDto>;
