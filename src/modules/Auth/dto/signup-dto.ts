import { z, ZodError } from 'zod';
import { ValidationError } from '../../../utility/errors/userFacingError';
import { editProfileDto } from '../../User/dto/edit-profile-dto';
import { SignupUserReason } from '../../../utility/errors/error-reason';

export const signupDto = z
    .object({
        username: z.string().min(3).regex(/^\w+$/),
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'The passwords did not match',
                path: ['confirmPassword'],
            });
        }
    });

export const signupValidator = (input: any) => {
    try {
        return signupDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: SignupUserReason;
            if ('email' in formatedError) reason = SignupUserReason.InvalidEmail;
            if ('username' in formatedError) reason = SignupUserReason.InvalidUsername;
            if ('password' in formatedError) reason = SignupUserReason.InvalidPassword;
            if ('confirmPassword' in formatedError)
                // @ts-ignore
                reason = formatedError.confirmPassword._errors.includes(
                    'The passwords did not match'
                )
                    ? SignupUserReason.NotSamePasswords
                    : SignupUserReason.InvalidConfirmPassword;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type SignupDto = z.infer<typeof signupDto>;
