# Documentação do Banco de Dados - Finance io

## Visão Geral

O Finance io utiliza o PostgreSQL através do Supabase como banco de dados principal. A estrutura foi projetada para garantir:

- Integridade dos dados
- Segurança por design
- Escalabilidade
- Performance otimizada

## Tabelas

### users (auth.users)
Tabela gerenciada pelo Supabase Auth.

```sql
-- Estrutura gerenciada automaticamente pelo Supabase
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### transactions
Armazena todas as transações financeiras dos usuários.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Trigger para atualização automática de updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
```

### categories
Gerencia as categorias de transações.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Índices
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Trigger para atualização automática de updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
```

### reports
Armazena relatórios gerados pela IA.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  timeframe TEXT CHECK (timeframe IN ('week', 'month', 'year')) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_timeframe ON reports(timeframe);
```

## Funções e Triggers

### trigger_set_updated_at
```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### calculate_monthly_balance
```sql
CREATE OR REPLACE FUNCTION calculate_monthly_balance(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  total_income DECIMAL(10,2),
  total_expenses DECIMAL(10,2),
  balance DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_totals AS (
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions
    WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month
  )
  SELECT
    income as total_income,
    expenses as total_expenses,
    (income - expenses) as balance
  FROM monthly_totals;
END;
$$ LANGUAGE plpgsql;
```

## Políticas de Segurança (RLS)

### transactions
```sql
-- Política de leitura
CREATE POLICY "Usuários podem ler suas próprias transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Política de inserção
CREATE POLICY "Usuários podem inserir suas próprias transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de atualização
CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política de deleção
CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### categories
```sql
-- Política de leitura
CREATE POLICY "Usuários podem ler suas próprias categorias"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR is_default = true);

-- Política de inserção
CREATE POLICY "Usuários podem inserir suas próprias categorias"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de atualização
CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política de deleção
CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND NOT is_default);
```

## Views

### monthly_summary
```sql
CREATE VIEW monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
  COUNT(*) as transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date);
```

### category_distribution
```sql
CREATE VIEW category_distribution AS
SELECT
  user_id,
  category,
  type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM transactions
GROUP BY user_id, category, type;
```

## Backup e Restauração

### Backup Diário
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -Fc -v -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$DATE.dump
```

### Restauração
```bash
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_$DATE.dump
```

## Manutenção

### Vacuum
```sql
-- Executar periodicamente
VACUUM ANALYZE transactions;
VACUUM ANALYZE categories;
VACUUM ANALYZE reports;
```

### Reindex
```sql
-- Executar mensalmente
REINDEX TABLE transactions;
REINDEX TABLE categories;
REINDEX TABLE reports;
```

## Monitoramento

### Queries Lentas
```sql
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Uso de Índices
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Otimizações

### Particionamento
```sql
-- Particionamento por data para transações antigas
CREATE TABLE transactions_partitioned (
  LIKE transactions INCLUDING ALL
) PARTITION BY RANGE (date);

-- Criar partições por ano
CREATE TABLE transactions_2023 PARTITION OF transactions_partitioned
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
```

### Materialização de Views
```sql
-- View materializada para relatórios mensais
CREATE MATERIALIZED VIEW monthly_reports AS
SELECT
  user_id,
  date_trunc('month', date) as month,
  json_build_object(
    'income', SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
    'expenses', SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
    'categories', json_agg(DISTINCT category)
  ) as report_data
FROM transactions
GROUP BY user_id, date_trunc('month', date)
WITH DATA;

-- Atualizar view materializada
REFRESH MATERIALIZED VIEW monthly_reports;
``` 