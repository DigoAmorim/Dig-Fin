import type { ErrorRequestHandler } from 'express';
import { ErroAplicacao } from '../errors/AppError';
import { getLanguageFromHeader, translate } from '../i18n/config';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
    console.error(error);
    const language = getLanguageFromHeader(request.headers['accept-language']);

    if (error instanceof ErroAplicacao) {
        response.status(error.statusCode).json({ message: translate(`errors.${error.messageKey}`, language) });
        return;
    }

    response.status(500).json({ message: translate('errors.internal', language) });
};
