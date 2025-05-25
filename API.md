# Documentação das APIs - Finance io

## Endpoints da API

### Autenticação

#### Login
```typescript
POST /auth/v1/token
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": number,
  "refresh_token": "string",
  "user": User
}
```

#### Registro
```typescript
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "full_name": "string"
}

Response:
{
  "user": User,
  "session": Session
}
```

### Transações

#### Listar Transações
```typescript
GET /rest/v1/transactions
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "uuid",
      "description": "string",
      "amount": number,
      "type": "income" | "expense",
      "category": "string",
      "date": "string",
      "created_at": "string"
    }
  ]
}
```

#### Criar Transação
```typescript
POST /rest/v1/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "string",
  "amount": number,
  "type": "income" | "expense",
  "category": "string",
  "date": "string"
}

Response:
{
  "data": {
    "id": "uuid",
    "description": "string",
    "amount": number,
    "type": "income" | "expense",
    "category": "string",
    "date": "string",
    "created_at": "string"
  }
}
```

#### Excluir Transação
```typescript
DELETE /rest/v1/transactions?id=eq.{id}
Authorization: Bearer {token}

Response: 204 No Content
```

### Categorias

#### Listar Categorias
```typescript
GET /rest/v1/categories
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "income" | "expense",
      "is_default": boolean,
      "created_at": "string"
    }
  ]
}
```

#### Criar Categoria
```typescript
POST /rest/v1/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "type": "income" | "expense",
  "is_default": boolean
}

Response:
{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "income" | "expense",
    "is_default": boolean,
    "created_at": "string"
  }
}
```

#### Atualizar Categoria
```typescript
PATCH /rest/v1/categories?id=eq.{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string"
}

Response:
{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "income" | "expense",
    "is_default": boolean,
    "created_at": "string"
  }
}
```

#### Excluir Categoria
```typescript
DELETE /rest/v1/categories?id=eq.{id}
Authorization: Bearer {token}

Response: 204 No Content
```

### Relatórios IA

#### Gerar Relatório
```typescript
POST /api/v1/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "timeframe": "week" | "month" | "year",
  "transactions": Transaction[],
  "categories": Category[]
}

Response:
{
  "data": {
    "summary": string,
    "insights": string[],
    "recommendations": string[],
    "charts": {
      "spending_patterns": Object,
      "category_distribution": Object
    }
  }
}
```

## Tipos de Dados

### User
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Session
```typescript
interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
}
```

## Códigos de Erro

### Autenticação
- 401: Token inválido ou expirado
- 403: Permissão negada
- 422: Dados de entrada inválidos

### Transações
- 400: Requisição inválida
- 404: Transação não encontrada
- 409: Conflito de dados

### Categorias
- 400: Requisição inválida
- 404: Categoria não encontrada
- 409: Categoria já existe

## Headers Comuns

### Requisição
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Resposta
```
Content-Type: application/json
Cache-Control: no-cache
```

## Paginação

### Parâmetros
```
?page=1&per_page=20
```

### Resposta
```json
{
  "data": [],
  "meta": {
    "total": number,
    "per_page": number,
    "current_page": number,
    "last_page": number
  }
}
```

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário
- Headers de resposta incluem:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Webhooks

### Eventos Disponíveis
- transaction.created
- transaction.deleted
- category.created
- category.updated
- category.deleted

### Formato do Payload
```json
{
  "event": "string",
  "data": Object,
  "created_at": "string"
}
```

## Ambiente de Desenvolvimento

### Base URLs
- Produção: `https://api.financeio.com`
- Desenvolvimento: `https://dev-api.financeio.com`
- Local: `http://localhost:54321`

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://oooxngcquideicyrqmvo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEEPSEEK_API_KEY=string
```

## Exemplos de Uso

### Curl
```bash
# Login
curl -X POST https://api.financeio.com/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"******"}'

# Listar Transações
curl https://api.financeio.com/rest/v1/transactions \
  -H "Authorization: Bearer {token}"
```

### JavaScript/TypeScript
```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/auth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Criar Transação
const createTransaction = async (transaction: Transaction) => {
  const response = await fetch('/rest/v1/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transaction)
  });
  return response.json();
};
``` 