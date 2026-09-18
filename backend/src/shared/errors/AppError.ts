export class ErroAplicacao extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly messageKey: string,
    ) {
        super(messageKey);
        this.name = 'ErroAplicacao';
    }
}
