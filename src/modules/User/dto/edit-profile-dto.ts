import { z, ZodError } from 'zod';
import { zodFileSchema } from '../../../utility/file-parser';
import { ValidationError } from '../../../utility/errors/userFacingError';
import { EditProfileReason } from '../../../utility/errors/error-reason';

export const editProfileDto = z
    .object({
        email: z.string().email(),
        password: z.string().min(8).optional(),
        confirmPassword: z.string().min(8).optional(),
        image: zodFileSchema.optional(),
        fName: z.string().min(3),
        lName: z.string().min(3),
        bio: z.string(),
        isPrivate: z.coerce.boolean(),
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

export const editProfileDtoValidator = (input: any) => {
    try {
        return editProfileDto.parse(input);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatedError = error.format();
            let reason: EditProfileReason;
            if ('email' in formatedError) reason = EditProfileReason.InvalidEmail;
            if ('password' in formatedError) reason = EditProfileReason.InvalidPassword;
            if ('confirmPassword' in formatedError)
                // @ts-ignore
                reason = formatedError.confirmPassword._errors.includes(
                    'The passwords did not match'
                )
                    ? EditProfileReason.NotSamePasswords
                    : EditProfileReason.InvalidConfirmPassword;
            if ('image' in formatedError) reason = EditProfileReason.InvalidImage;
            if ('fName' in formatedError) reason = EditProfileReason.InvalidFName;
            if ('lName' in formatedError) reason = EditProfileReason.InvalidLName;
            if ('bio' in formatedError) reason = EditProfileReason.InvalidBio;
            if ('isPrivate' in formatedError) reason = EditProfileReason.InvalidIsPrivate;
            if ('isPrivate' in formatedError) reason = EditProfileReason.InvalidIsPrivate;

            throw new ValidationError(reason!, formatedError);
        }
    }
};

export type EditProfileDto = z.infer<typeof editProfileDto>;
