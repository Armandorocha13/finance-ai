# Documentação Técnica - Finance io

## Arquitetura do Sistema

### 1. Frontend (React + TypeScript)

#### Estrutura de Diretórios
```
src/
├── components/       # Componentes React reutilizáveis
├── contexts/        # Contextos da aplicação (Auth, etc)
├── hooks/           # Hooks personalizados
├── integrations/    # Integrações com serviços externos
├── lib/            # Utilitários e helpers
├── pages/          # Componentes de página
└── services/       # Serviços da aplicação
```

#### Principais Componentes

##### Dashboard (`src/components/Dashboard.tsx`)
- Centro de controle principal da aplicação
- Gerencia estado global de transações
- Exibe gráficos e métricas
- Controla navegação entre abas

##### TransactionList (`src/components/TransactionList.tsx`)
- Exibe lista de transações
- Implementa funcionalidade de exclusão
- Formatação de dados
- Feedback visual

##### TransactionForm (`src/components/TransactionForm.tsx`)
- Formulário de criação/edição
- Validação de dados
- Integração com categorias
- Feedback em tempo real

##### CategoryManager (`src/components/CategoryManager.tsx`)
- Gerenciamento de categorias
- CRUD completo
- Categorias padrão
- Validações

##### AIReport (`src/components/AIReport.tsx`)
- Geração de relatórios
- Integração com IA
- Análise de dados
- Exportação

### 2. Backend (Supabase)

#### Estrutura do Banco de Dados

##### Tabela: transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  description TEXT,
  amount DECIMAL(10,2),
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Tabela: categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Políticas de Segurança
```sql
-- Leitura: usuário só vê suas próprias transações
CREATE POLICY "Usuários podem ler suas próprias transações"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- Inserção: usuário só insere suas próprias transações
CREATE POLICY "Usuários podem inserir suas próprias transações"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Deleção: usuário só deleta suas próprias transações
CREATE POLICY "Usuários podem deletar suas próprias transações"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Integrações

#### Supabase
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

#### DeepSeek (IA)
```typescript
// src/services/deepseek.ts
export const generateAIReport = async (data: TransactionData) => {
  const response = await fetch('API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### 4. Hooks Personalizados

#### useTransactions
```typescript
// src/hooks/useTransactions.ts
export const useTransactions = () => {
  // Gerenciamento de estado com React Query
  const queryClient = useQueryClient();
  
  // Queries e Mutations
  const { data: transactions } = useQuery(...);
  const addTransaction = useMutation(...);
  const deleteTransaction = useMutation(...);
  
  return {
    transactions,
    addTransaction,
    deleteTransaction,
    // ...
  };
};
```

#### useAuth
```typescript
// src/contexts/AuthContext.tsx
export const useAuth = () => {
  // Gerenciamento de autenticação
  const [user, setUser] = useState<User | null>(null);
  const signIn = async (email: string, password: string) => {...};
  const signOut = async () => {...};
  
  return {
    user,
    signIn,
    signOut,
    // ...
  };
};
```

### 5. Estilização

#### Tema Principal
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
        // ...
      },
      animation: {
        blob: 'blob 7s infinite',
        // ...
      }
    }
  }
};
```

### 6. PWA

#### Configuração
```json
// manifest.json
{
  "name": "Finance io",
  "short_name": "Finance io",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [...]
}
```

#### Service Worker
```javascript
// service-worker.js
self.addEventListener('install', (event) => {...});
self.addEventListener('fetch', (event) => {...});
self.addEventListener('activate', (event) => {...});
```

## Fluxos de Dados

### 1. Autenticação
1. Usuário insere credenciais
2. Supabase valida credenciais
3. Token JWT é armazenado
4. Contexto de autenticação é atualizado

### 2. Transações
1. Usuário cria/edita transação
2. Dados são validados localmente
3. Mutation é executada
4. Cache é invalidado
5. UI é atualizada

### 3. Relatórios IA
1. Usuário solicita relatório
2. Dados são coletados
3. Requisição é enviada à API DeepSeek
4. Relatório é gerado e exibido

## Boas Práticas

### 1. Performance
- Lazy loading de componentes
- Memoização de cálculos pesados
- Otimização de re-renders
- Caching de queries

### 2. Segurança
- Validação de dados
- Sanitização de inputs
- Políticas de RLS
- Proteção contra XSS

### 3. UX
- Feedback imediato
- Loading states
- Error handling
- Animações suaves

## Manutenção

### 1. Logs
- Erros de autenticação
- Falhas em transações
- Problemas de conexão
- Performance metrics

### 2. Backups
- Backup diário do banco
- Exportação de dados
- Restore points

### 3. Updates
- Dependências
- Security patches
- Feature releases
- Hotfixes

## Troubleshooting

### Problemas Comuns

1. Falha na Autenticação
```typescript
// Verificar
console.error('Auth Error:', error);
// Solução comum
await supabase.auth.refreshSession();
```

2. Erro de Sincronização
```typescript
// Verificar
console.error('Sync Error:', error);
// Solução comum
queryClient.invalidateQueries(['transactions']);
```

3. Problemas Offline
```typescript
// Verificar
if (!navigator.onLine) {
  // Usar dados em cache
  return getCachedData();
}
```

## Contribuição

### Processo de Desenvolvimento

1. Clone o repositório
2. Instale dependências
3. Crie branch feature/
4. Desenvolva com TDD
5. Faça PR

### Padrões de Código

- ESLint config
- Prettier config
- Commit messages
- PR template

## Recursos Adicionais

- [Documentação Supabase](https://supabase.io/docs)
- [React Query Docs](https://react-query.tanstack.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/) 