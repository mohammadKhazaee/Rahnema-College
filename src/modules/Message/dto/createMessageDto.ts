import z, { ZodError } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';
import { SendMessageReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

export const createMessageDto = z
    .object({
        content: z.string(),
    })
    .or(
        z.object({
            image: zodFileSchema,
        })
    );

export const createMessageValidator = (input: any) => {
    try {
        return createMessageDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: SendMessageReason;
            if ('content' in formatedError) reason = SendMessageReason.InvalidContent;
            if ('image' in formatedError) reason = SendMessageReason.InvalidImage;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type CreateMessageDto = z.infer<typeof createMessageDto>;
