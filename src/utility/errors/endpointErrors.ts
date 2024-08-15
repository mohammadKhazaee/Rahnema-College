import {
    ConflictError,
    NotFoundError,
    UnauthenticatedError,
    ValidationError,
} from './userFacingError';

export type SignupUserError = ConflictError | ValidationError;

export type LoginUserError = UnauthenticatedError | ValidationError;

export type SendResetEmailError = NotFoundError | ValidationError;

export type ResetPasswordError = NotFoundError | ValidationError;

export type CreatePostError = NotFoundError | ValidationError;

export type GetPostError = NotFoundError | ValidationError;

export type GetUserInfoError = UnauthenticatedError;

export type EditProfileError = ConflictError | ValidationError;

export type FollowUserError = NotFoundError;
