# DopamineMaxxing

App móvel para Android e iOS que reúne, em um único feed, vídeos e textos de várias redes sociais. O projeto foi construído com Expo, React Native, TypeScript e Supabase, com um modo demonstrativo completo para rodar sem backend.

## O que está implementado

- Feed vertical de vídeos com player, autoplay configurável, mudo, curtir, repostar, comentar e compartilhar.
- Feed de textos com filtros por rede, curtir, repostar, comentar e compartilhar.
- Comentários com criação, exclusão, contagem e atualização otimista.
- Perfil com nome, username, avatar, localização opcional e redes conectadas.
- Onboarding com aceite de termos, consentimentos granulares e verificação de 18+.
- Autenticação por e-mail e senha via Supabase, além de modo demo local.
- Configurações de tema, modo desempenho, economia de dados, autoplay, exportação e exclusão de conta.
- Termos de Uso, política de privacidade e central de privacidade LGPD dentro do app.
- Fallback automático para dados locais quando o Supabase não está configurado.

## Stack

- Expo SDK 58 / React Native 0.88 / React 19.3 / TypeScript
- Expo Router
- Supabase (Postgres, Auth e Storage)
- AsyncStorage, SecureStore, expo-video, expo-image, expo-image-picker, expo-location, expo-file-system
- Testes com `node:test` + `tsx`

## Começando

```bash
npm install
cp .env.example .env
npm start
```

O `.npmrc` habilita `legacy-peer-deps` por causa do conflito de peer dependency entre `react-dom@19.3.1` e `react@19.3.0` no ecossistema Expo 58.

Sem variáveis do Supabase, o app inicia em modo demo. Escolha "Entrar no modo demonstração" na tela inicial. Os dados ficam no AsyncStorage do dispositivo.

### Variáveis de ambiente

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Nunca use a `service_role` no app. Ela só pode existir em Edge Functions ou scripts server-side.

## Supabase

1. Crie um projeto na região `sa-east-1`.
2. Instale e vincule o CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push
   ```

3. Em Authentication, configure:
   - Site URL: `dopaminemaxxing://`
   - Redirect URLs: `dopaminemaxxing://**`
   - Confirmação de e-mail conforme o ambiente.
4. As migrações criam as tabelas, políticas RLS, o bucket privado `avatars` e as funções de LGPD.
5. O primeiro carregamento do feed chama `seed_demo_posts()` para popular dados demonstrativos por usuário.

Detalhes em [`supabase/README.md`](supabase/README.md).

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # testes de validação e compartilhamento
npm run lint        # Expo ESLint
npm run figma:sync  # exporta frames e tokens do Figma
```

## Figma

- Prompt de design: [`docs/figma-prompt.md`](docs/figma-prompt.md)
- Exportação via API:

  ```bash
  FIGMA_TOKEN=... FIGMA_FILE_KEY=... npm run figma:sync
  ```

O script grava `figma-export/file.json`, `figma-export/manifest.json` e imagens em `figma-export/frames/`. O token nunca é enviado ao app.

## Redes sociais e APIs

O feed real depende de APIs oficiais. Instagram, TikTok, X e Threads não oferecem, gratuitamente, acesso ao feed pessoal de contas seguidas nem permitem curtir/comentar/repostar em nome do usuário fora de seus próprios conteúdos. Por isso, essas redes estão implementadas como conexões simuladas no modo demo.

Mastodon e Bluesky têm APIs abertas viáveis. YouTube e Reddit têm APIs gratuitas com cotas e aprovação. A análise completa, com limites e alternativas, está em [`docs/analise-redes-sociais.md`](docs/analise-redes-sociais.md).

O projeto não faz scraping e não armazena tokens de redes sociais.

## LGPD e privacidade

- Coleta mínima: e-mail, perfil, conexões, consentimentos, interações e comentários.
- Localização é opcional e só é registrada com consentimento.
- Avatares ficam em bucket privado com URLs assinadas.
- Exportação e exclusão de conta são feitas por funções SQL `security definer`.
- Bases legais, retenção e direitos estão documentados em [`docs/lgpd.md`](docs/lgpd.md).

## Estrutura

```text
src/
  app/            rotas Expo Router
  components/     UI e componentes de feed
  constants/      tema e metadados de redes
  hooks/          feed, comentários, avatar, performance
  lib/            validação, share, erros, demo e Supabase
  providers/      auth, settings e profile
  types/          modelos de domínio
supabase/
  migrations/     schema, RLS, storage e LGPD
  seed.sql        observação sobre o seed por usuário
docs/             arquitetura, requisitos, LGPD, APIs e Figma
scripts/          sincronização com Figma
```

## Limitações conhecidas

- Conectores reais de redes sociais ainda não foram implementados; o app usa dados demo.
- A sincronização do Figma exige token e file key próprios.
- O `eas.json` está configurado, mas nenhum build de distribuição foi executado neste ambiente.
- Testes cobrem utilitários puros; fluxos de UI e RLS ainda precisam de testes de integração.
- O modo desempenho reduz animações, autoplay e uso de imagens, mas não substitui medições em dispositivos reais.

## Licença

MIT. Consulte [`LICENSE`](LICENSE).
