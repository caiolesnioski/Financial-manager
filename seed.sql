-- ============================================================
-- ⚠️  AVISO: NAO EXECUTE ESTE ARQUIVO EM PRODUCAO!
-- ============================================================
-- Este arquivo contem dados de exemplo apenas para desenvolvimento/testes.
-- Executar em producao pode corromper dados reais.
-- ============================================================

-- Seed sample data
-- Replace REPLACE_WITH_USER_ID with an actual auth user UUID before running
-- Example UUID format: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- =====================
-- CONTAS DE EXEMPLO
-- =====================
INSERT INTO public.accounts (user_id, name, type, initial_balance, current_balance)
VALUES
  ('REPLACE_WITH_USER_ID', 'Conta Corrente Banco do Brasil', 'bank', 2500.00, 2350.75),
  ('REPLACE_WITH_USER_ID', 'Carteira', 'wallet', 200.00, 150.00),
  ('REPLACE_WITH_USER_ID', 'Poupanca Nubank', 'bank', 5000.00, 5000.00);

-- =====================
-- LIMITES DE EXEMPLO
-- =====================
INSERT INTO public.limits (user_id, category, limit_value, used_value, percentage)
VALUES
  ('REPLACE_WITH_USER_ID', 'Alimentacao', 800.00, 245.50, 31),
  ('REPLACE_WITH_USER_ID', 'Transporte', 400.00, 180.00, 45),
  ('REPLACE_WITH_USER_ID', 'Lazer', 300.00, 275.00, 92),
  ('REPLACE_WITH_USER_ID', 'Saude', 500.00, 0.00, 0);

-- =====================
-- LANCAMENTOS DE EXEMPLO
-- =====================
INSERT INTO public.entries (user_id, type, description, category, account, value, date, repeat)
VALUES
  -- Despesas
  ('REPLACE_WITH_USER_ID', 'expense', 'Supermercado Extra', 'Alimentacao', NULL, 156.78, '2025-01-15 10:30:00', false),
  ('REPLACE_WITH_USER_ID', 'expense', 'Uber para o trabalho', 'Transporte', NULL, 25.50, '2025-01-16 08:15:00', false),
  ('REPLACE_WITH_USER_ID', 'expense', 'Restaurante Sabor da Terra', 'Alimentacao', NULL, 88.72, '2025-01-17 13:00:00', false),
  ('REPLACE_WITH_USER_ID', 'expense', 'Cinema com amigos', 'Lazer', NULL, 75.00, '2025-01-18 19:30:00', false),
  ('REPLACE_WITH_USER_ID', 'expense', 'Gasolina posto Shell', 'Transporte', NULL, 154.50, '2025-01-19 16:45:00', false),
  ('REPLACE_WITH_USER_ID', 'expense', 'Netflix mensal', 'Lazer', NULL, 55.90, '2025-01-20 00:00:00', true),
  ('REPLACE_WITH_USER_ID', 'expense', 'Show de rock', 'Lazer', NULL, 144.10, '2025-01-21 21:00:00', false),

  -- Receitas
  ('REPLACE_WITH_USER_ID', 'income', 'Salario Janeiro', 'Salario', NULL, 4500.00, '2025-01-05 00:00:00', true),
  ('REPLACE_WITH_USER_ID', 'income', 'Freelance website', 'Freelance', NULL, 800.00, '2025-01-10 14:00:00', false),
  ('REPLACE_WITH_USER_ID', 'income', 'Venda item usado OLX', 'Vendas', NULL, 150.00, '2025-01-12 11:30:00', false);

-- =====================
-- NOTAS
-- =====================
-- Os dados acima sao ficticios e servem apenas para demonstracao.
-- Nomes, valores e datas sao exemplos genericos.
-- Para usar em desenvolvimento:
--   1. Crie um usuario no Supabase Auth
--   2. Copie o UUID do usuario
--   3. Substitua todos os 'REPLACE_WITH_USER_ID' pelo UUID real
--   4. Execute este script no SQL Editor do Supabase
