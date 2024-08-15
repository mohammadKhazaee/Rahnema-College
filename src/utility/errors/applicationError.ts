export default abstract class ApplicationError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public reason?: string
    ) {
        super(message);
    }
}
