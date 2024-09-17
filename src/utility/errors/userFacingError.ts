import ApplicationError from './applicationError';

export abstract class UserFacingError extends ApplicationError {
    constructor(public statusCode: number, public reason: string, message?: any) {
        super(statusCode, message || '');
    }
}

export class BadRequestError extends UserFacingError {
    public readonly BadRequestError: string = 'BadRequestError';

    constructor(reason: string, message?: string) {
        super(400, reason, message);
    }
}

export class NotFoundError extends UserFacingError {
    public readonly NotFoundError: string = 'NotFoundError';

    constructor(reason: string, message?: string) {
        super(404, reason, message);
        this.statusCode = 404;
    }
}

export class ConflictError extends UserFacingError {
    public readonly ConflictError: string = 'ConflictError';

    constructor(reason: string, message?: string) {
        super(409, reason, message);
    }
}

export class ValidationError extends UserFacingError {
    public readonly ValidationError: string = 'ValidationError';

    constructor(
        reason: string,
        message?: {
            _errors: string[];
        }
    ) {
        super(422, reason, message);
    }
}

export class UnauthenticatedError extends UserFacingError {
    public readonly UnauthenticatedError: string = 'UnauthenticatedError';

    constructor(reason: string, message?: string) {
        super(401, reason, message);
    }
}

export class ForbiddenError extends UserFacingError {
    public readonly ForbiddenError: string = 'ForbiddenError';

    constructor(reason: string, message?: string) {
        super(403, reason, message);
    }
}
