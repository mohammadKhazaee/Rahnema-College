export default abstract class ApplicationError extends Error {
    constructor(public statusCode: number, public message: any) {
        super(message);
    }
}
