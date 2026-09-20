ALTER TABLE digfin.transacao
    DROP CONSTRAINT IF EXISTS ck_transacao_tipo_origem,
    DROP CONSTRAINT IF EXISTS ck_transacao_subcategoria_tipo,
    DROP CONSTRAINT IF EXISTS ck_transacao_valor_tipo;

ALTER TABLE digfin.transacao
    ADD CONSTRAINT ck_transacao_tipo_origem
        CHECK (
            (tipo = 'expense' AND origem IN ('card', 'pix', 'withdrawal'))
            OR (tipo = 'income' AND origem IN ('card_refund', 'pix', 'deposit'))
            OR (tipo = 'transfer' AND origem = 'transfer')
        ),
    ADD CONSTRAINT ck_transacao_subcategoria_tipo
        CHECK ((tipo = 'transfer' AND subcategoria_id IS NULL) OR (tipo IN ('expense', 'income') AND subcategoria_id IS NOT NULL)),
    ADD CONSTRAINT ck_transacao_valor_tipo
        CHECK (
            (tipo = 'expense' AND valor < 0)
            OR (tipo = 'income' AND valor > 0)
            OR (tipo = 'transfer' AND valor <> 0)
        );