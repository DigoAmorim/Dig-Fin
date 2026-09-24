ALTER TABLE digfin.conta_bancaria
    ADD COLUMN IF NOT EXISTS pluggy_account_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS pluggy_status VARCHAR(30) NOT NULL DEFAULT 'nao_sincronizada';

ALTER TABLE digfin.conta_bancaria
    ADD CONSTRAINT chk_conta_bancaria_pluggy_status
    CHECK (pluggy_status IN ('nao_sincronizada', 'sincronizada'));

CREATE INDEX IF NOT EXISTS ix_conta_bancaria_pluggy_status
ON digfin.conta_bancaria (conta_id, pluggy_status);
