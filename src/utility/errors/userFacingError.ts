import ApplicationError from './applicationError';

export abstract class UserFacingError extends ApplicationError {
    constructor(public statusCode: number, public reason: string, message?: any) {
        super(statusCode, message || '');
    }
}

export class BadRequestError extends UserFacingError {
    constructor(reason: string, message?: string) {
        super(400, reason, message);
    }
}

export class NotFoundError extends UserFacingError {
    constructor(reason: string, message?: string) {
        super(404, reason, message);
    }
}

export class ConflictError extends UserFacingError {
    constructor(reason: string, message?: string) {
        super(409, reason, message);
    }
}

export class ValidationError extends UserFacingError {
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
    constructor(reason: string, message?: string) {
        super(401, reason, message);
    }
}

export class ForbiddenError extends UserFacingError {
    constructor(reason: string, message?: string) {
        super(403, reason, message);
    }
}
