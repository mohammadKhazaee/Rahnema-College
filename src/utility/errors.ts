export class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message?: string) {
        super(404, message || 'NotFound');
    }
}

export class ForbiddenError extends HttpError {
    constructor(message?: string) {
        super(403, message || 'Forbidden');
    }
}

export class NotAuthorizedError extends HttpError {
    constructor(message?: string) {
        super(401, message || 'NotAuthorized');
    }
}
