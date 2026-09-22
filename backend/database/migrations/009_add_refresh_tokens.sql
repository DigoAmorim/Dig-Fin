CREATE TABLE digfin.refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_em TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revogado_em TIMESTAMPTZ,
    substituido_por UUID,
    user_agent TEXT,
    ip TEXT,

    CONSTRAINT fk_refresh_token_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES digfin.usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_token_substituido_por
        FOREIGN KEY (substituido_por)
        REFERENCES digfin.refresh_token(id)
);

CREATE INDEX ix_refresh_token_usuario ON digfin.refresh_token (usuario_id);
CREATE INDEX ix_refresh_token_expira_em ON digfin.refresh_token (expira_em);