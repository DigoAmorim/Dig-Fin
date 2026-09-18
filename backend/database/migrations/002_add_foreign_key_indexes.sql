CREATE INDEX IF NOT EXISTS ix_conta_bancaria_conta_instituicao
ON digfin.conta_bancaria (conta_id, instituicao_bancaria_id);

CREATE INDEX IF NOT EXISTS ix_cartao_credito_conta_bandeira
ON digfin.cartao_credito (conta_id, bandeira_cartao_id);