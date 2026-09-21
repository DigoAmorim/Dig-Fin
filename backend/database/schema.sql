CREATE SCHEMA IF NOT EXISTS digfin;

CREATE TABLE digfin.usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE digfin.conta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE digfin.conta_usuario (
    conta_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    papel VARCHAR(30) NOT NULL DEFAULT 'owner',

    CONSTRAINT pk_conta_usuario
        PRIMARY KEY (conta_id, usuario_id),

    CONSTRAINT fk_conta_usuario_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id),

    CONSTRAINT fk_conta_usuario_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES digfin.usuario(id)
);

CREATE TABLE digfin.bandeira_cartao (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_bandeira_cartao
        PRIMARY KEY (id),

    CONSTRAINT uk_bandeira_cartao_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_bandeira_cartao_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_bandeira_cartao_conta_descricao
ON digfin.bandeira_cartao (conta_id, LOWER(descricao));

CREATE TABLE digfin.instituicao_bancaria (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_instituicao_bancaria
        PRIMARY KEY (id),

    CONSTRAINT uk_instituicao_bancaria_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_instituicao_bancaria_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_instituicao_bancaria_conta_nome
ON digfin.instituicao_bancaria (conta_id, LOWER(nome));

CREATE TABLE digfin.conta_bancaria (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    instituicao_bancaria_id BIGINT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_conta_bancaria
        PRIMARY KEY (id),

    CONSTRAINT uk_conta_bancaria_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_conta_bancaria_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conta_bancaria_instituicao
        FOREIGN KEY (instituicao_bancaria_id, conta_id)
        REFERENCES digfin.instituicao_bancaria(id, conta_id)
        ON DELETE NO ACTION
);

CREATE UNIQUE INDEX uk_conta_bancaria_conta_nome
ON digfin.conta_bancaria (conta_id, LOWER(nome));

CREATE INDEX ix_conta_bancaria_conta_instituicao
ON digfin.conta_bancaria (conta_id, instituicao_bancaria_id);

CREATE TABLE digfin.categoria (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categoria
        PRIMARY KEY (id),

    CONSTRAINT uk_categoria_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_categoria_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_categoria_cor
        CHECK (cor ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE UNIQUE INDEX uk_categoria_conta_nome
ON digfin.categoria (conta_id, LOWER(nome));

CREATE INDEX ix_categoria_conta
ON digfin.categoria (conta_id, nome);

CREATE TABLE digfin.subcategoria (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    categoria_id BIGINT,
    nome VARCHAR(100) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_subcategoria
        PRIMARY KEY (id),

    CONSTRAINT uk_subcategoria_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_subcategoria_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subcategoria_categoria_mesma_conta
        FOREIGN KEY (categoria_id, conta_id)
        REFERENCES digfin.categoria(id, conta_id),

);

CREATE UNIQUE INDEX uk_subcategoria_conta_nome
ON digfin.subcategoria (conta_id, LOWER(nome));

CREATE INDEX ix_subcategoria_conta_categoria
ON digfin.subcategoria (conta_id, categoria_id, nome);

CREATE TABLE digfin.cartao_credito (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    nome VARCHAR(50) NOT NULL,
    bandeira_cartao_id BIGINT NOT NULL,
    dia_vencimento SMALLINT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_cartao_credito
        PRIMARY KEY (id),

    CONSTRAINT uk_cartao_credito_id_conta
        UNIQUE (id, conta_id),

    CONSTRAINT fk_cartao_credito_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartao_credito_bandeira
        FOREIGN KEY (bandeira_cartao_id, conta_id)
        REFERENCES digfin.bandeira_cartao(id, conta_id)
        ON DELETE NO ACTION,

    CONSTRAINT ck_cartao_credito_dia_vencimento
        CHECK (dia_vencimento BETWEEN 1 AND 31)
);

CREATE INDEX ix_cartao_credito_conta_bandeira
ON digfin.cartao_credito (conta_id, bandeira_cartao_id);

CREATE TABLE digfin.transacao (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conta_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    data_lancamento DATE NOT NULL,
    data_competencia DATE NOT NULL,
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
    CONSTRAINT fk_transacao_conta FOREIGN KEY (conta_id) REFERENCES digfin.conta(id) ON DELETE CASCADE,
    CONSTRAINT fk_transacao_subcategoria FOREIGN KEY (subcategoria_id, conta_id) REFERENCES digfin.subcategoria(id, conta_id),
    CONSTRAINT fk_transacao_conta_bancaria FOREIGN KEY (conta_bancaria_id, conta_id) REFERENCES digfin.conta_bancaria(id, conta_id),
    CONSTRAINT fk_transacao_cartao_credito FOREIGN KEY (cartao_credito_id, conta_id) REFERENCES digfin.cartao_credito(id, conta_id),
    CONSTRAINT ck_transacao_tipo CHECK (tipo IN ('expense', 'income', 'transfer')),
    CONSTRAINT ck_transacao_origem CHECK (origem IS NULL OR origem IN ('card', 'pix', 'withdrawal', 'card_refund', 'deposit', 'transfer')),
    CONSTRAINT ck_transacao_parcelas CHECK (numero_parcela BETWEEN 1 AND total_parcelas AND total_parcelas >= 1),
    CONSTRAINT ck_transacao_valor CHECK (valor <> 0),
    CONSTRAINT ck_transacao_tipo_origem CHECK (
        (tipo = 'expense' AND origem IN ('card', 'pix', 'withdrawal'))
        OR (tipo = 'income' AND origem IN ('card_refund', 'pix', 'deposit'))
        OR (tipo = 'transfer' AND origem = 'transfer')
    ),
    CONSTRAINT ck_transacao_subcategoria_tipo CHECK ((tipo = 'transfer' AND subcategoria_id IS NULL) OR (tipo IN ('expense', 'income') AND subcategoria_id IS NOT NULL)),
    CONSTRAINT ck_transacao_valor_tipo CHECK (
        (tipo = 'expense' AND valor < 0)
        OR (tipo = 'income' AND valor > 0)
        OR (tipo = 'transfer' AND valor <> 0)
    ),
    CONSTRAINT ck_transacao_origem_recurso CHECK (
        (origem IN ('card', 'card_refund') AND cartao_credito_id IS NOT NULL AND conta_bancaria_id IS NULL)
        OR (origem IN ('pix', 'withdrawal', 'deposit') AND conta_bancaria_id IS NOT NULL AND cartao_credito_id IS NULL)
        OR (origem = 'transfer' AND conta_bancaria_id IS NOT NULL AND cartao_credito_id IS NULL)
        OR (origem IS NULL AND conta_bancaria_id IS NULL AND cartao_credito_id IS NULL)
    )
);

CREATE INDEX ix_transacao_conta_data ON digfin.transacao (conta_id, data_lancamento);
CREATE INDEX ix_transacao_conta_competencia ON digfin.transacao (conta_id, data_competencia);
CREATE INDEX ix_transacao_conta_grupo ON digfin.transacao (conta_id, grupo_parcelamento);
CREATE INDEX ix_transacao_conta_subcategoria ON digfin.transacao (conta_id, subcategoria_id);

INSERT INTO digfin.conta (id, nome)
VALUES ('00000000-0000-0000-0000-000000000001', 'Conta de Desenvolvimento')
ON CONFLICT (id) DO NOTHING;