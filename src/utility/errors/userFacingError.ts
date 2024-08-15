import ApplicationError from './applicationError';

export class UserFacingError extends ApplicationError {
    constructor(statusCode: number, message: string) {
        super(statusCode, message);
    }
}

export class BadRequestError extends UserFacingError {
    constructor(message: string) {
        super(400, message);
    }
}

export class NotFoundError extends UserFacingError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ConflictError extends UserFacingError {
    constructor(message: string) {
        super(409, message);
    }
}

export class ValidationError extends UserFacingError {
    constructor(message: string) {
        super(422, message);
    }
}

export class UnauthenticatedError extends UserFacingError {
    constructor(message: string) {
        super(401, message);
    }
}

export class ForbiddenError extends UserFacingError {
    constructor(message: string) {
        super(403, message);
    }
}
