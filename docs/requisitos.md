# Requisitos e rastreabilidade

## Requisitos funcionais

| ID | Requisito | Implementação | Status |
| --- | --- | --- | --- |
| RF01 | Feed unificado de vídeos e textos | `(tabs)/videos.tsx`, `(tabs)/texts.tsx`, `useFeed` | Implementado |
| RF02 | Player vertical com autoplay, mudo e pausa | `VideoFeedItem`, `expo-video` | Implementado |
| RF03 | Feed de textos com filtro por rede | `(tabs)/texts.tsx` | Implementado |
| RF04 | Curtir e repostar com atualização otimista | `useFeed`, `FeedActions` | Implementado |
| RF05 | Comentários com criar e excluir | `post/[id].tsx`, `useComments` | Implementado |
| RF06 | Compartilhamento nativo, WhatsApp e abrir original | `ShareSheet`, `share-utils` | Implementado |
| RF07 | Conexão e desconexão de redes | `settings/connected.tsx` | Implementado como metadado/simulação |
| RF08 | Perfil com avatar, nome, username e localização | `profile.tsx`, `edit-profile.tsx`, `ProfileForm` | Implementado |
| RF09 | Onboarding com 18+, termos e consentimentos | `(onboarding)/connect`, `(onboarding)/profile` | Implementado |
| RF10 | Configurações de tema e desempenho | `settings.tsx`, `SettingsProvider` | Implementado |
| RF11 | Autenticação por e-mail e senha | `AuthProvider`, `sign-in`, `sign-up` | Implementado |
| RF12 | Modo demo sem backend | `DemoRepository`, `demo/store.ts` | Implementado |
| RF13 | Exportação de dados | `export_my_data()`, `settings.tsx` | Implementado |
| RF14 | Exclusão de conta | `delete_my_account()`, `settings.tsx` | Implementado |
| RF15 | Política de privacidade no app | `settings/privacy-policy.tsx` | Implementado |
| RF16 | Sincronização com Figma | `scripts/figma-sync.mjs`, `docs/figma-prompt.md` | Implementado; requer credenciais |
| RF17 | Conectores reais de redes sociais | — | Pendente |
| RF18 | Upload de vídeo próprio | — | Fora do escopo inicial |
| RF19 | Notificações push | — | Fora do escopo inicial |
| RF20 | Moderação de conteúdo | — | Pendente para produção |
| RF21 | Termos de Uso no app | `(auth)/terms.tsx`, `settings.tsx` | Implementado |

## Requisitos não funcionais

| ID | Requisito | Implementação | Status |
| --- | --- | --- | --- |
| RNF01 | Android e iOS | Expo/React Native | Implementado |
| RNF02 | TypeScript estrito | `tsconfig.json` | Implementado |
| RNF03 | Tema claro e escuro | `useAppTheme`, tokens | Implementado |
| RNF04 | Modo desempenho | `usePerformance`, player único, listas otimizadas | Implementado |
| RNF05 | Segurança e RLS | migrações 002 e 003 | Implementado |
| RNF06 | LGPD | consentimentos, exportação, exclusão, política | Implementado |
| RNF07 | Acessibilidade | labels, contraste, áreas de toque | Parcial; validar em dispositivo |
| RNF08 | Testes automatizados | `validation.test.ts`, `share.test.ts` | Parcial; faltam UI/RLS/E2E |
| RNF09 | Lint e typecheck | `npm run lint`, `npm run typecheck` | Implementado |
| RNF10 | Custo zero no protótipo | demo + Supabase free | Implementado |
| RNF11 | Offline mínimo | AsyncStorage no demo | Parcial |
| RNF12 | Observabilidade | — | Pendente |
| RNF13 | Build de distribuição | `eas.json` | Configurado; falta executar build |

## Fluxos principais

1. Abrir app sem sessão -> welcome.
2. Criar conta -> onboarding -> feed.
3. Entrar com e-mail -> feed ou onboarding.
4. Entrar no modo demo -> feed com dados locais.
5. Rolar vídeos -> player ativo, autoplay, mudo.
6. Curtir/repostar -> estado otimista.
7. Comentar -> lista e composer.
8. Compartilhar -> share sheet.
9. Editar perfil -> salvar -> perfil atualizado.
10. Conectar/desconectar rede -> estado persistido.
11. Alterar tema/desempenho -> efeito imediato.
12. Exportar dados -> JSON compartilhado.
13. Excluir conta -> confirmação -> logout.
14. Revogar consentimento -> persistido.

## Critérios de aceite globais

- `npm run typecheck` sem erros.
- `npm test` com todos os testes passando.
- `npm run lint` sem erros.
- Nenhum segredo no repositório.
- Nenhuma chamada de scraping.
- Feed funciona sem Supabase.
- Feed funciona com Supabase configurado.
- Exclusão remove todos os dados do usuário.
- Exportação inclui todos os dados do usuário.
- Avatares são privados.
- Textos em português do Brasil.
- Telas respeitam safe areas.

## Pendências para produção

- Aprovar textos jurídicos e preencher dados do controlador/DPO.
- Implementar conectores reais com OAuth e Edge Functions.
- Executar builds assinados com EAS.
- Configurar Sentry ou equivalente.
- Adicionar testes de RLS e E2E.
- Revisar política de retenção de backups.
- Preencher Data Safety e Privacy Nutrition Label.
- Validar acessibilidade com TalkBack e VoiceOver.
- Testar em dispositivos físicos de diferentes tamanhos.
