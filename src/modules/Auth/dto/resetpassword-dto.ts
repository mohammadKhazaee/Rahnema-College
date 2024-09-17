import z, { ZodError } from 'zod';
import { SendResetEmailReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

export const resetPasswordDto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
    })
    .or(
        z.object({
            email: z.string().email(),
        })
    );

export const resetPasswordValidator = (input: any) => {
    try {
        return resetPasswordDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: SendResetEmailReason;
            if ('email' in formatedError) reason = SendResetEmailReason.InvalidEmail;
            if ('username' in formatedError) reason = SendResetEmailReason.InvalidUsername;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type ResetPaswordDto = z.infer<typeof resetPasswordDto>;
