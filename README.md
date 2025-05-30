# Assistente de Atividades

Um aplicativo web simples para gerenciar atividades diárias com um assistente IA integrado.

## Funcionalidades

- **Autenticação de Usuários**
  - Registro de nova conta
  - Login/Logout
  - Dados salvos localmente

- **Gerenciamento de Atividades**
  - Adicionar novas atividades com nome e descrição
  - Visualizar lista de atividades
  - Excluir atividades
  - Configurar alertas para atividades

- **Assistente IA**
  - Responde a perguntas em linguagem natural
  - Sugere horários com base nas atividades cadastradas
  - Ajuda a configurar alertas
  - Aprende padrões das atividades do usuário

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 4
- LocalStorage para persistência de dados

## Como Usar

1. Abra o arquivo `index.html` em um navegador web moderno
2. Crie uma nova conta ou faça login
3. Comece a adicionar suas atividades
4. Interaja com o assistente IA através do chat
5. Configure alertas para suas atividades

## Estrutura do Projeto

- `index.html` - Estrutura da página e interface do usuário
- `style.css` - Estilos personalizados
- `script.js` - Lógica da aplicação e funcionalidades

## Armazenamento de Dados

Todos os dados são armazenados localmente no navegador usando localStorage:

- `users` - Lista de usuários registrados
- `currentUser` - Dados do usuário atual
- `alerts` - Lista de alertas configurados

## Limitações

- Os dados são armazenados apenas localmente no navegador
- As notificações funcionam apenas se o navegador suportar e o usuário permitir
- O assistente IA é baseado em regras simples e padrões básicos

## Sugestões de Melhorias Futuras

1. Adicionar sincronização com servidor
2. Implementar um sistema de IA mais avançado
3. Adicionar categorias para atividades
4. Implementar sistema de prioridades
5. Adicionar suporte a anexos e imagens
6. Implementar compartilhamento de atividades 