# Supabase

Este diretório contém o schema, as políticas RLS, o bucket de avatares e as funções de LGPD do DopamineMaxxing.

## Pré-requisitos

- Conta e projeto no Supabase.
- Supabase CLI via `npx supabase`.
- Região recomendada: `sa-east-1`.

## Aplicar as migrações

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Migrações:

1. `20261028000100_init.sql`: enums, tabelas, índices, triggers, perfis e seed de demonstração.
2. `20261028000200_rls.sql`: RLS, grants e políticas.
3. `20261028000300_storage.sql`: bucket privado `avatars` e políticas por usuário.
4. `20261028000400_lgpd.sql`: exportação, exclusão, purga e função de seed.

## Configuração de Auth

No dashboard, em Authentication:

- Site URL: `dopaminemaxxing://`
- Redirect URLs: `dopaminemaxxing://**`
- Email confirmation: ative em produção; opcional em desenvolvimento.
- Minimum password length: 8.
- Leaked password protection: ative se disponível.
- Rate limits: mantenha os padrões e monitore.

O app usa `signInWithPassword`, `signUp` e `signOut`. Não há login social nem recuperação de senha no estado atual.

## Variáveis do app

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

A chave `service_role` não deve aparecer no app, no repositório ou em logs.

## Storage

A migração cria o bucket `avatars` com:

- Privado.
- Limite de 2 MB.
- MIME types `image/jpeg`, `image/png` e `image/webp`.
- Políticas de select/insert/update/delete apenas para o próprio usuário, usando o primeiro segmento do path como `auth.uid()`.

O app salva o path no perfil e gera URLs assinadas de 1 hora. Ao trocar o avatar, o app remove o arquivo anterior; ao excluir a conta, lista e remove todos os arquivos da pasta do usuário.

## Seed de demonstração

O seed global é intencionalmente vazio. Os posts demo são por usuário e dependem de `auth.uid()`. Após criar uma conta e entrar no app, o primeiro carregamento do feed executa:

```sql
select public.seed_demo_posts();
```

Para executar manualmente no SQL Editor, simule o usuário na sessão (ou use o app):

```sql
select set_config(
  'request.jwt.claims',
  json_build_object('sub', 'USER_UUID', 'role', 'authenticated')::text,
  true
);
select public.seed_demo_posts();
```

A função é idempotente por `(user_id, network, source_post_id)`.

## Funções LGPD

### Exportar

```sql
select public.export_my_data();
```

Retorna JSON com conta (e-mail), perfil, configurações, conexões, consentimentos, posts, interações, comentários e solicitações. Também registra uma solicitação `export`.

### Excluir conta

```sql
select public.delete_my_account();
```

Remove `auth.users` e cascateia para os dados de domínio. A ação é irreversível. O app pede confirmação explícita em um diálogo destrutivo antes de chamar.

### Purgar comentários

```sql
select public.purge_soft_deleted_comments();
```

Remove comentários com `deleted_at` há mais de 30 dias. Agende com `pg_cron` se disponível:

```sql
select cron.schedule(
  'purge-soft-deleted-comments',
  '0 3 * * *',
  $$select public.purge_soft_deleted_comments();$$
);
```

## RLS

Todas as tabelas de domínio têm RLS habilitado.

- `profiles`: leitura e atualização apenas do próprio perfil.
- `user_settings`: apenas o próprio usuário.
- `connected_accounts`: apenas o próprio usuário.
- `consents`: apenas o próprio usuário.
- `data_requests`: apenas o próprio usuário.
- `posts`: leitura apenas do próprio feed; escrita apenas via função privilegiada.
- `post_interactions`: apenas o próprio usuário e em posts próprios.
- `comments`: leitura, escrita e exclusão apenas do próprio usuário e em posts próprios.

### Teste rápido de isolamento

Crie dois usuários de teste e, com a sessão de cada um, execute:

```sql
select id, user_id, username from public.profiles;
select id, user_id, caption from public.posts;
select id, user_id, body from public.comments;
```

Cada usuário deve ver apenas o próprio perfil, seus posts e comentários. Posts de outros usuários não são visíveis no modelo atual.

## Edge Functions futuras

Para conectores reais:

1. Crie uma função `oauth-exchange` para trocar código por token.
2. Guarde tokens em uma tabela privada com RLS bloqueando o cliente.
3. Use `service_role` apenas dentro da função.
4. Exponha ao app endpoints normalizados.
5. Valide escopos, cotas e revogação.

Nunca coloque tokens de redes sociais em `EXPO_PUBLIC_*`.

## Backup e retenção

- Configure backups conforme o plano do Supabase.
- Documente o prazo de retenção.
- Teste restauração periodicamente.
- Não inclua dados de produção em ambientes de desenvolvimento.

## Checklist de produção

- [ ] Projeto em `sa-east-1`.
- [ ] Migrações aplicadas.
- [ ] Auth com confirmação de e-mail.
- [ ] Redirect URLs corretas.
- [ ] Bucket privado verificado.
- [ ] RLS testado com dois usuários.
- [ ] `service_role` fora do app.
- [ ] Backup configurado.
- [ ] `pg_cron` agendado, se disponível.
- [ ] Política de privacidade publicada.
- [ ] Dados do controlador e DPO preenchidos.
