import type { ErrorRequestHandler, Request } from 'express';
import { ErroAplicacao } from '../errors/AppError';
import { getLanguageFromHeader, translate } from '../i18n/config';

const localizedMessagePreference = 'localized-error-message';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
    console.error(error);

    if (error instanceof ErroAplicacao) {
        response.status(error.statusCode).json(createErrorResponse(error, request));
        return;
    }

    const internalError = new ErroAplicacao(500, 'internal');
    response.status(500).json(createErrorResponse(internalError, request));
};

const createErrorResponse = (error: ErroAplicacao, request: Request) => {
    const response: { code: string; params: Record<string, unknown>; message?: string } = {
        code: error.code,
        params: error.params,
    };

    if (request.headers.prefer?.includes(localizedMessagePreference)) {
        response.message = translate(
            `errors.${error.code}`,
            getLanguageFromHeader(request.headers['accept-language']),
            error.params,
        );
    }

    return response;
};
