DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_subcategoria_id_conta' AND conrelid = 'digfin.subcategoria'::regclass) THEN
        ALTER TABLE digfin.subcategoria ADD CONSTRAINT uk_subcategoria_id_conta UNIQUE (id, conta_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_conta_bancaria_id_conta' AND conrelid = 'digfin.conta_bancaria'::regclass) THEN
        ALTER TABLE digfin.conta_bancaria ADD CONSTRAINT uk_conta_bancaria_id_conta UNIQUE (id, conta_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cartao_credito_id_conta' AND conrelid = 'digfin.cartao_credito'::regclass) THEN
        ALTER TABLE digfin.cartao_credito ADD CONSTRAINT uk_cartao_credito_id_conta UNIQUE (id, conta_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS digfin.transacao (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    data_lancamento DATE NOT NULL,
    subcategoria_id BIGINT,
    origem VARCHAR(20),
    conta_bancaria_id BIGINT,
    cartao_credito_id BIGINT,
    grupo_parcelamento UUID NOT NULL,
    numero_parcela SMALLINT NOT NULL DEFAULT 1,
    total_parcelas SMALLINT NOT NULL DEFAULT 1,
    valor NUMERIC(14, 2) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_transacao PRIMARY KEY (id),
    CONSTRAINT fk_transacao_conta FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id) ON DELETE CASCADE,
    CONSTRAINT fk_transacao_subcategoria FOREIGN KEY (subcategoria_id, conta_id)
        REFERENCES digfin.subcategoria(id, conta_id) ON DELETE NO ACTION,
    CONSTRAINT fk_transacao_conta_bancaria FOREIGN KEY (conta_bancaria_id, conta_id)
        REFERENCES digfin.conta_bancaria(id, conta_id) ON DELETE NO ACTION,
    CONSTRAINT fk_transacao_cartao_credito FOREIGN KEY (cartao_credito_id, conta_id)
        REFERENCES digfin.cartao_credito(id, conta_id) ON DELETE NO ACTION,
    CONSTRAINT ck_transacao_tipo CHECK (tipo IN ('expense', 'income', 'transfer')),
    CONSTRAINT ck_transacao_origem CHECK (origem IS NULL OR origem IN ('card', 'pix', 'withdrawal')),
    CONSTRAINT ck_transacao_parcelas CHECK (numero_parcela BETWEEN 1 AND total_parcelas AND total_parcelas >= 1),
    CONSTRAINT ck_transacao_valor CHECK (valor <> 0),
    CONSTRAINT ck_transacao_origem_recurso CHECK (
        (origem = 'card' AND cartao_credito_id IS NOT NULL AND conta_bancaria_id IS NULL)
        OR (origem IN ('pix', 'withdrawal') AND conta_bancaria_id IS NOT NULL AND cartao_credito_id IS NULL)
        OR (origem IS NULL AND conta_bancaria_id IS NULL AND cartao_credito_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS ix_transacao_conta_data
ON digfin.transacao (conta_id, data_lancamento);

CREATE INDEX IF NOT EXISTS ix_transacao_conta_grupo
ON digfin.transacao (conta_id, grupo_parcelamento);

CREATE INDEX IF NOT EXISTS ix_transacao_conta_subcategoria
ON digfin.transacao (conta_id, subcategoria_id);
