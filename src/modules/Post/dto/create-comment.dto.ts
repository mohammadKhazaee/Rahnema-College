import { z, ZodError } from 'zod';
import { CreateCommentReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

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
        parentId: z.string().uuid(),
    }),
]);

export const createCommentValidator = (input: any) => {
    try {
        return createCommentDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: CreateCommentReason;
            if ('postId' in formatedError) reason = CreateCommentReason.InvalidPostId;
            if ('type' in formatedError) reason = CreateCommentReason.InvalidType;
            if ('content' in formatedError) reason = CreateCommentReason.InvalidContent;
            if ('parentId' in formatedError) reason = CreateCommentReason.InvalidParentId;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type CreateCommentDto = z.infer<typeof createCommentDto>;
