DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_bandeira_cartao_id_conta'
          AND conrelid = 'digfin.bandeira_cartao'::regclass
    ) THEN
        ALTER TABLE digfin.bandeira_cartao
            ADD CONSTRAINT uk_bandeira_cartao_id_conta UNIQUE (id, conta_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_instituicao_bancaria_id_conta'
          AND conrelid = 'digfin.instituicao_bancaria'::regclass
    ) THEN
        ALTER TABLE digfin.instituicao_bancaria
            ADD CONSTRAINT uk_instituicao_bancaria_id_conta UNIQUE (id, conta_id);
    END IF;
END $$;

ALTER TABLE digfin.conta_bancaria
    DROP CONSTRAINT IF EXISTS fk_conta_bancaria_instituicao;

ALTER TABLE digfin.conta_bancaria
    ADD CONSTRAINT fk_conta_bancaria_instituicao
    FOREIGN KEY (instituicao_bancaria_id, conta_id)
    REFERENCES digfin.instituicao_bancaria(id, conta_id)
    ON DELETE NO ACTION;

ALTER TABLE digfin.cartao_credito
    DROP CONSTRAINT IF EXISTS fk_cartao_credito_bandeira;

ALTER TABLE digfin.cartao_credito
    ADD CONSTRAINT fk_cartao_credito_bandeira
    FOREIGN KEY (bandeira_cartao_id, conta_id)
    REFERENCES digfin.bandeira_cartao(id, conta_id)
    ON DELETE NO ACTION;

