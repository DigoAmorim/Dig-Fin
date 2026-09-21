ALTER TABLE digfin.subcategoria
    DROP CONSTRAINT IF EXISTS ck_subcategoria_cor,
    DROP COLUMN IF EXISTS cor;