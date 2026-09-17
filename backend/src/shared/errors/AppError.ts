export class ErroAplicacao extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = 'ErroAplicacao';
    }
}
