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

    CONSTRAINT fk_bandeira_cartao_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_bandeira_cartao_conta_descricao
ON digfin.bandeira_cartao (conta_id, LOWER(descricao));

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
    cor VARCHAR(7) NOT NULL,
    icone VARCHAR(50) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_subcategoria
        PRIMARY KEY (id),

    CONSTRAINT fk_subcategoria_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subcategoria_categoria_mesma_conta
        FOREIGN KEY (categoria_id, conta_id)
        REFERENCES digfin.categoria(id, conta_id),

    CONSTRAINT ck_subcategoria_cor
        CHECK (cor ~ '^#[0-9A-Fa-f]{6}$')
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

    CONSTRAINT fk_cartao_credito_conta
        FOREIGN KEY (conta_id)
        REFERENCES digfin.conta(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartao_credito_bandeira
        FOREIGN KEY (bandeira_cartao_id)
        REFERENCES digfin.bandeira_cartao(id),

    CONSTRAINT ck_cartao_credito_dia_vencimento
        CHECK (dia_vencimento BETWEEN 1 AND 31)
);

INSERT INTO digfin.conta (id, nome)
VALUES ('00000000-0000-0000-0000-000000000001', 'Conta de Desenvolvimento')
ON CONFLICT (id) DO NOTHING;