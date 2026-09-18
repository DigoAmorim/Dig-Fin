export class ErroAplicacao extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        public readonly params: Record<string, unknown> = {},
    ) {
        super(code);
        this.name = 'ErroAplicacao';
    }
}
