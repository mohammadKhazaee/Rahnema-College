import z, { ZodError } from 'zod';
import { LoginUserReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

export const logindto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
        password: z.string().min(8, 'Please enter a valid password'),
        rememberMe: z.boolean(),
    })
    .or(
        z.object({
            email: z.string().email(),
            password: z.string().min(8, 'Should be more than 8 character'),
            rememberMe: z.boolean(),
        })
    );

export const loginValidator = (input: any) => {
    try {
        return logindto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: LoginUserReason;
            if ('email' in formatedError) reason = LoginUserReason.InvalidEmail;
            if ('username' in formatedError) reason = LoginUserReason.InvalidUsername;
            if ('password' in formatedError) reason = LoginUserReason.InvalidPassword;
            if ('rememberMe' in formatedError) reason = LoginUserReason.InvalidRememberMe;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type LoginDto = z.infer<typeof logindto>;
