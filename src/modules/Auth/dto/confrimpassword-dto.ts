import z, { ZodError } from 'zod';
import { ResetPasswordReason } from '../../../utility/errors/error-reason';
import { ValidationError } from '../../../utility/errors/userFacingError';

export const confirmpassworddto = z
    .object({
        newPassword: z.string().min(8, 'Should be more than 8 character'),
        confirmPassword: z.string().min(8, 'Should be more than 8 character'),
    })
    .superRefine(({ confirmPassword, newPassword }, ctx) => {
        if (confirmPassword !== newPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'The passwords did not match',
                path: ['confirmPassword'],
            });
        }
    });

export const confirmpasswordValidator = (input: any) => {
    try {
        return confirmpassworddto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: ResetPasswordReason;
            if ('password' in formatedError) reason = ResetPasswordReason.InvalidNewPassword;
            if ('confirmPassword' in formatedError)
                // @ts-ignore
                reason = formatedError.confirmPassword._errors.includes(
                    'The passwords did not match'
                )
                    ? ResetPasswordReason.NotSamePasswords
                    : ResetPasswordReason.InvalidConfirmPassword;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type ConfirmPasswordDto = z.infer<typeof confirmpassworddto>;
