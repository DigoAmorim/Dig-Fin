ALTER TABLE digfin.transacao
    ADD COLUMN IF NOT EXISTS data_competencia DATE;

UPDATE digfin.transacao
SET data_competencia = data_lancamento;

ALTER TABLE digfin.transacao
    ALTER COLUMN data_competencia SET NOT NULL;

CREATE INDEX IF NOT EXISTS ix_transacao_conta_competencia
ON digfin.transacao (conta_id, data_competencia);
