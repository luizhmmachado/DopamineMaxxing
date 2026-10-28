# Arquitetura

## Visão geral

O DopamineMaxxing é um app Expo/React Native com Expo Router. A mesma base de código atende Android e iOS. O backend é opcional: sem Supabase configurado, o app usa um repositório demo persistido no AsyncStorage. Com Supabase, usa Auth, Postgres com RLS e Storage privado.

```text
┌─────────────────────────────────────────────┐
│                App Expo Router              │
│                                             │
│  (auth) ─ (onboarding) ─ (tabs) ─ settings  │
│      │          │           │          │    │
│      └──────────┴───────────┴──────────┘    │
│                     │                       │
│              Providers (Auth,               │
│           Settings, Profile)                │
│                     │                       │
│              Repository factory             │
│                ┌────┴────┐                  │
│          DemoRepository  SupabaseRepository │
│                │              │             │
│           AsyncStorage    Supabase SDK      │
└─────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Supabase          │
                    │ Auth / Postgres   │
                    │ Storage / RLS     │
                    └───────────────────┘
```

## Decisões principais

### Expo e React Native

Uma única base para Android e iOS reduz custo e acelera iteração. O Expo Router oferece rotas por arquivos e deep links. O projeto usa React Compiler e New Architecture.

### Supabase

Postgres com RLS, Auth e Storage em um único provedor. A região recomendada é `sa-east-1` para reduzir latência no Brasil. O app usa apenas a chave `anon`; operações privilegiadas ficam em funções SQL `security definer` ou, no futuro, Edge Functions.

### Modo demo

O modo demo permite validar o produto sem backend, sem custo e sem depender de APIs de terceiros. O `DemoRepository` implementa a mesma interface do `SupabaseRepository`, o que mantém as telas agnósticas.

### Sem tokens de redes sociais

O app não armazena tokens de Instagram, TikTok, X, Threads, YouTube etc. As conexões atuais são metadados e simulações. Quando integrações reais forem adicionadas, os tokens devem ficar em uma tabela privada ou Edge Function, nunca no cliente.

## Estrutura de pastas

```text
src/
  app/
    _layout.tsx              providers e stack raiz
    index.tsx                redirecionamento por sessão/onboarding
    (auth)/                  welcome, sign-in, sign-up, terms
    (onboarding)/            conexões e perfil
    (tabs)/                  vídeos, textos, perfil, ajustes
    post/[id].tsx            comentários
    settings/                edição, conexões, privacidade, sobre
  components/
    ui/                      componentes base
    feed/                    vídeo, texto, ações e share sheet
  constants/                 tema e metadados de redes
  hooks/                     feed, comentários, avatar, performance
  lib/
    demo/                    dados e store local
    supabase/                client, mappers e repository
    repository.ts            interface e factory
    validation.ts            validações puras
    share-utils.ts           texto e URL de compartilhamento
    errors.ts                tradução de erros
    storage.ts               SecureStore chunked
  providers/                 auth, settings, profile
  types/                     modelos de domínio
supabase/
  migrations/                schema, RLS, storage, LGPD
  seed.sql
scripts/
  figma-sync.mjs
docs/
```

## Fluxo de autenticação

1. `AuthProvider` lê a sessão demo no AsyncStorage.
2. Se não houver demo, lê a sessão do Supabase.
3. `onAuthStateChange` mantém o estado sincronizado.
4. `ProfileProvider` busca perfil, conexões e consentimentos quando há usuário.
5. `src/app/index.tsx` decide entre welcome, onboarding e tabs.
6. Em modo demo, o usuário é `demo-user` e os dados ficam no AsyncStorage.
7. Em Supabase, o trigger `handle_new_user` cria o perfil.

A sessão do Supabase é persistida com um adapter que usa SecureStore em chunks de 1800 bytes e AsyncStorage como fallback. O refresh automático é pausado quando o app vai para segundo plano.

## Fluxo de feed

1. `useFeed(kind)` chama `repository.listPosts(kind)`.
2. O repositório Supabase consulta `posts` com interações do usuário.
3. Se o feed estiver vazio, chama `seed_demo_posts()` uma vez.
4. O hook mantém posts, loading, refreshing e erro.
5. Curtir/repostar é otimista e reverte em caso de erro.
6. `useFocusEffect` atualiza silenciosamente ao voltar para a aba.

### Vídeo

- `expo-video` com um único player compartilhado.
- O player é criado uma vez e recebe `replace` quando o item ativo muda.
- Apenas o item ativo recebe o player.
- Autoplay respeita modo desempenho, foco da tela e estado do app.
- O modo desempenho também reduz animações, autoplay e cache em disco.

### Texto

- FlatList com cards e filtros por rede.
- Pull to refresh.
- Imagens com `expo-image` e placeholder.

## Fluxo de comentários

1. `useComments(postId)` lista comentários com perfil do autor.
2. Adicionar é otimista? Não: aguarda o insert e então anexa o comentário retornado.
3. Excluir é otimista e reverte em erro.
4. No Supabase, o trigger `comments_assert_owner` impede comentar em post de outro usuário.
5. Soft delete mantém o comentário por 30 dias e `purge_soft_deleted_comments()` remove depois.

## Modelo de dados

```text
auth.users
  └─ profiles (1:1)
       ├─ user_settings (1:1)
       ├─ connected_accounts (1:N)
       ├─ consents (1:N)
       ├─ data_requests (1:N)
       ├─ posts (1:N)
       ├─ post_interactions (1:N)
       └─ comments (1:N)

posts
  ├─ post_interactions (1:N)
  └─ comments (1:N)
```

Todas as tabelas de domínio referenciam `profiles(id)`. A exclusão de `auth.users` cascateia para todos os dados.

## Segurança

- RLS habilitado em todas as tabelas de domínio.
- Leitura de posts permitida apenas para o próprio feed.
- Escrita de posts apenas via função `security definer`.
- Interações e comentários só para o próprio usuário.
- Funções privilegiadas com `search_path` fixo.
- Bucket `avatars` privado, limite de 2 MB e MIME types restritos.
- URLs assinadas de 1 hora para avatares.
- Nenhum segredo no bundle; apenas `EXPO_PUBLIC_SUPABASE_*`.
- Exportação e exclusão via RPC autenticada.

## LGPD

- Consentimentos granulares: essencial, personalização, métricas e localização.
- Localização só é gravada se o consentimento estiver ativo.
- Exportação em JSON inclui perfil, configurações, conexões, consentimentos, posts, interações, comentários e solicitações.
- Exclusão remove `auth.users`, cascateia os dados e tenta apagar os avatares do usuário.
- Retenção de comentários excluídos: 30 dias.
- Logs não devem conter tokens, senhas ou dados sensíveis.

Detalhes em [`lgpd.md`](lgpd.md).

## Desempenho

- Modo desempenho desliga animações de navegação, autoplay e reduz cache em disco.
- `FlatList` com `removeClippedSubviews`, `windowSize` e `maxToRenderPerBatch` ajustados.
- Player único evita múltiplos vídeos simultâneos.
- Imagens com `cachePolicy="memory-disk"`.
- Preferir `expo-image` a `Image` para caching e placeholders.
- Evitar estado global desnecessário; providers pequenos e memoizados.

## Custo

- Expo/EAS: plano gratuito para desenvolvimento; builds e atualizações têm limites.
- Supabase: plano gratuito para protótipo; limites de banco, storage, MAU e egress.
- Figma: plano gratuito suficiente para protótipo; API disponível mediante token.
- APIs de redes: gratuitas apenas nos casos indicados; X e acessos empresariais são pagos.
- Não há servidor próprio nem CDN paga no estado atual.

## Build e distribuição

1. Configure `eas.json` e uma conta Expo.
2. `eas build --platform android` e `eas build --platform ios`.
3. Configure credenciais de assinatura.
4. Para iOS, preencha App Store Connect e privacidade do app.
5. Para Android, preencha Data Safety e política de privacidade.
6. Publique em TestFlight/Internal Testing antes da loja.

O `eas.json` já está configurado com perfis development, preview e production. Falta vincular a conta Expo e executar o primeiro build.

## Limitações atuais

- Conectores reais de redes sociais não implementados.
- Sem upload de vídeo próprio.
- Sem notificações push.
- Sem moderação automática de conteúdo.
- Sem cache offline explícito além do AsyncStorage do modo demo.
- Sem testes E2E.
- Sem observabilidade em produção.

## Próximos passos técnicos

1. Edge Functions para OAuth PKCE e refresh de tokens.
2. Conectores Mastodon e Bluesky.
3. Cache incremental e sincronização em background.
4. Testes de RLS com pgTAP ou integração.
5. Refinar ícones e splash com identidade visual final.
6. Monitoramento de erros e métricas anônimas opt-in.
