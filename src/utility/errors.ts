export class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message)
    }
}

export class NotFoundError extends HttpError {
    constructor() {
        super(404, 'NotFound')
    }
}


export class ForbiddenError extends HttpError {
    constructor() {
        super(403, 'Forbidden')
    }
}


export class NotAuthorizedError extends HttpError {
    constructor() {
        super(401, 'NotAuthorized')
    }
}



