ALTER TABLE digfin.transacao
    ADD COLUMN IF NOT EXISTS pluggy_transaction_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS ux_transacao_pluggy_transaction_id
ON digfin.transacao (conta_id, pluggy_transaction_id)
WHERE pluggy_transaction_id IS NOT NULL;
