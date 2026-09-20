ALTER TABLE digfin.transacao
    DROP CONSTRAINT ck_transacao_origem,
    DROP CONSTRAINT ck_transacao_origem_recurso;

ALTER TABLE digfin.transacao
    ADD CONSTRAINT ck_transacao_origem
        CHECK (origem IS NULL OR origem IN ('card', 'pix', 'withdrawal', 'card_refund', 'deposit')),
    ADD CONSTRAINT ck_transacao_origem_recurso
        CHECK (
            (origem IN ('card', 'card_refund') AND cartao_credito_id IS NOT NULL AND conta_bancaria_id IS NULL)
            OR (origem IN ('pix', 'withdrawal', 'deposit') AND conta_bancaria_id IS NOT NULL AND cartao_credito_id IS NULL)
            OR (origem IS NULL AND conta_bancaria_id IS NULL AND cartao_credito_id IS NULL)
        );