# Documentação do Banco de Dados

## Diagrama Entidade-Relacionamento (MER)

```
[Users] 1 ----< [Activities] 1 ----< [Alerts]
   |
   |
   1
   |
   ∨
[AIPatterns]

```

## Entidades e Relacionamentos

### Users (Usuários)
- **PK**: user_id (INT)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Activities (Atividades)
- **PK**: activity_id (INT)
- **FK**: user_id (INT) -> Users
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Alerts (Alertas)
- **PK**: alert_id (INT)
- **FK**: activity_id (INT) -> Activities
- time (TIME)
- message (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)

### AIPatterns (Padrões de IA)
- **PK**: pattern_id (INT)
- **FK**: user_id (INT) -> Users
- pattern_type (VARCHAR)
- pattern_data (JSON)
- frequency (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Relacionamentos

1. **Users -> Activities**: Um usuário pode ter várias atividades (1:N)
   - Quando um usuário é deletado, todas as suas atividades são deletadas (ON DELETE CASCADE)

2. **Activities -> Alerts**: Uma atividade pode ter vários alertas (1:N)
   - Quando uma atividade é deletada, todos os seus alertas são deletados (ON DELETE CASCADE)

3. **Users -> AIPatterns**: Um usuário pode ter vários padrões de IA (1:N)
   - Quando um usuário é deletado, todos os seus padrões são deletados (ON DELETE CASCADE)

## Índices

1. `idx_user_email`: Otimiza busca de usuários por email
2. `idx_user_activities`: Otimiza busca de atividades por usuário
3. `idx_activity_alerts`: Otimiza busca de alertas por atividade
4. `idx_user_patterns`: Otimiza busca de padrões de IA por usuário e tipo

## Estrutura de Dados da IA

### Pattern Types (Tipos de Padrões)
1. **time_preference**: Armazena preferências de horários do usuário
   ```json
   {
     "morning": ["08:00", "09:00"],
     "afternoon": ["14:00", "15:00"],
     "night": ["20:00", "21:00"]
   }
   ```

2. **activity_type**: Armazena padrões de tipos de atividades
   ```json
   {
     "study": ["14:00", "16:00"],
     "medication": ["08:00", "20:00"],
     "exercise": ["07:00"]
   }
   ```

## Notas de Implementação

1. **Segurança**:
   - Senhas são armazenadas como hashes
   - Email é único para cada usuário
   - Índices otimizam consultas frequentes

2. **Auditoria**:
   - Campos created_at e updated_at para rastreamento
   - Histórico de alterações através de timestamps

3. **Integridade**:
   - Chaves estrangeiras garantem integridade referencial
   - Cascade delete mantém consistência dos dados

4. **Performance**:
   - Índices nas colunas mais consultadas
   - JSON para dados flexíveis da IA
   - Tipos de dados otimizados para cada coluna 