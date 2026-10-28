# Análise de viabilidade das redes sociais

## Resumo executivo

O objetivo do DopamineMaxxing é reunir, em um único feed, conteúdos de várias redes. Isso é tecnicamente possível apenas dentro dos limites das APIs oficiais de cada plataforma. Não existe uma API pública gratuita que entregue o feed pessoal completo de Instagram, TikTok, X ou Threads e permita curtir, comentar ou repostar conteúdos de terceiros em nome do usuário.

A estratégia adotada é:

1. Entregar um produto funcional com dados demonstrativos e interações locais.
2. Integrar primeiro as redes com APIs abertas e viáveis: Mastodon e Bluesky.
3. Integrar YouTube e Reddit com OAuth e cotas gratuitas.
4. Tratar Instagram, TikTok, X e Threads como conexões simuladas até existir parceria, acesso empresarial ou API oficial adequada.

O app não faz scraping, não usa automação de navegador e não armazena tokens de redes sociais.

## Estratégia launcher agregador (feeds sem API livre)

Para redes sem API oficial viável (Instagram, TikTok, X, Threads, Facebook, LinkedIn, Pinterest), o app não tenta reproduzir o feed dentro de uma WebView nem quebrar o design dark/premium. Em vez disso, adota um comportamento de "launcher agregador":

- Cada post no feed exibe a ação "Abrir na rede", que abre o link nativo da postagem via `Linking.openURL` (app oficial da rede instalado ou fallback para a web).
- O feed do DopamineMaxxing mantém sua identidade visual, mas a leitura profunda fica delegada ao app oficial da rede, preservando sessões, cookies e termos de cada plataforma.
- Uma WebView só é aceitável como tela opcional e separada (não no feed), com aviso claro de que a experiência é da rede externa.

Não há token coletável do usuário que habilite o feed pessoal dessas redes: Instagram, TikTok, X e Threads não expõem o feed de contas seguidas gratuitamente, mesmo com token do usuário.

## Matriz de APIs

| Rede | API oficial | Gratuita | Feed pessoal | Interações de terceiros | Viabilidade no app | Observações |
| --- | --- | --- | --- | --- | --- | --- |
| Mastodon | Sim, API do servidor | Sim | Sim, home timeline com token do usuário | Favoritar, reblogar e comentar | Alta | Rate limits por instância; federação e regras variam. |
| Bluesky | Sim, AT Protocol | Sim | Sim, timeline autenticada | Curtir, repostar e responder | Alta | Rate limits e políticas em evolução; OAuth ainda requer cuidado. |
| YouTube | Sim, Data API v3 | Sim, com cota | Parcial: inscrições e vídeos públicos, não o feed personalizado | Comentar e avaliar via OAuth | Média | Cota diária de 10.000 unidades; busca consome muitas unidades. |
| Reddit | Sim, Data API | Sim para uso não comercial | Parcial: listings e subreddits; feed personalizado é limitado | Votar, comentar e salvar | Média | Termos comerciais e limites de uso; aprovação pode ser necessária. |
| Instagram | Sim, Graph API | Sim | Não para contas seguidas | Apenas conteúdos próprios e de contas business | Baixa | Exige conta business/creator, app Meta, revisão e permissões. |
| TikTok | Sim, Display/Content Posting | Sim, com aprovação | Não para o feed de contas seguidas | Apenas conteúdos próprios | Baixa | Aprovação e escopos restritos; Research API é para pesquisa. |
| X | Sim, X API | Não para leitura relevante | Não no plano gratuito | Publicação e leitura limitadas | Muito baixa | Planos pagos; feed completo não é oferecido de forma acessível. |
| Threads | Sim, Threads API | Sim | Não para o feed de contas seguidas | Publicação e respostas próprias | Baixa | API focada na conta autorizada, não em consumo geral. |
| Facebook | Sim, Graph API | Sim | Não para o feed pessoal | Páginas e conteúdos próprios | Baixa | Permissões e revisão; feed pessoal não é exposto. |
| LinkedIn | Sim, Marketing/Community APIs | Parcial | Não | Publicação em organizações | Muito baixa | Acesso restrito e voltado a empresas. |
| Pinterest | Sim | Parcial | Não | Pins próprios | Baixa | Aprovação e escopos limitados. |
| Twitch | Sim, Helix | Sim | Parcial: canais seguidos e lives | Chat e follows | Média | Não é uma rede de feed social geral. |

As informações acima refletem as APIs públicas disponíveis em 2026. Termos, cotas e preços mudam; valide antes de implementar cada conector.

## O que cada rede permite de fato

### Instagram

A Graph API atende contas business e creator. As permissões usuais permitem ler mídia da própria conta, comentários, insights e publicar conteúdo. Não há endpoint para o feed doméstico da conta autenticada nem para interagir com posts de terceiros. O app pode exibir o próprio conteúdo, mas não reproduzir a experiência de consumo do Instagram.

### TikTok

A Display API entrega informações e vídeos do usuário autorizado. A Content Posting API publica conteúdo. O feed "For You" e o feed de contas seguidas não são expostos. A Research API é destinada a pesquisadores aprovados e não serve para um app de consumo.

### X

O acesso à API é comercial. Os planos gratuitos são insuficientes para leitura de timeline e interações em escala. Não há caminho gratuito para reproduzir o feed pessoal.

### Threads

A Threads API é centrada na conta autorizada: publicar, responder e ler métricas. Não entrega o feed de contas seguidas para consumo no app.

### YouTube

A Data API v3 permite listar vídeos, canais, playlists e inscrições com OAuth. O feed inicial personalizado não é exposto. A cota gratuita é suficiente para protótipos, mas não para uso intenso. Comentários e avaliações exigem escopos adicionais.

### Reddit

A Data API permite ler listings, subreddits e comentários, além de votar e comentar com OAuth. O feed personalizado é limitado e o uso comercial exige acordo. A aprovação e os limites precisam ser considerados.

### Mastodon

Cada instância expõe a API do Mastodon. Com um token do usuário, é possível ler a home timeline, favoritar, reblogar e responder. É a integração mais próxima do objetivo original e a mais simples de validar. O app precisa lidar com diferentes instâncias, regras e limites.

### Bluesky

O AT Protocol permite autenticação, leitura de timeline e interações. A API é aberta, mas as políticas e os limites evoluem. É uma boa segunda integração.

## Estratégias que não serão usadas

- Scraping de HTML ou endpoints internos.
- Automação de navegador com credenciais do usuário.
- Engenharia reversa de aplicativos.
- Compra ou uso de tokens de terceiros.
- Exibição de conteúdo sem link e atribuição à fonte.

Essas abordagens violam termos de uso, criam risco jurídico e quebram com frequência.

## Arquitetura recomendada para conectores reais

1. O app autentica o usuário no provedor via OAuth PKCE.
2. O app troca o código por tokens em uma Edge Function.
3. A função guarda os tokens criptografados em uma tabela privada, nunca acessível ao cliente.
4. A função busca o feed, normaliza os dados e grava posts em cache.
5. O app lê apenas os posts normalizados via RLS.
6. Ações de escrita passam pela Edge Function, que valida escopos e limites.
7. Tokens podem ser revogados a qualquer momento pelo usuário.

No estado atual, o app não persiste tokens de redes sociais. As conexões são apenas metadados (`connected_accounts`) e o modo demo simula o feed.

## Roadmap sugerido

### Fase 1: produto validável

- Modo demo completo.
- Supabase com autenticação, perfis, consentimentos e RLS.
- Feed de vídeos e textos, comentários, curtidas, reposts e compartilhamento.
- Conexões simuladas com rótulos claros de disponibilidade.

### Fase 2: primeiras integrações reais

- Mastodon: OAuth por instância, home timeline, favoritar, reblogar e responder.
- Bluesky: sessão, timeline, like, repost e reply.
- Cache de posts e sincronização incremental.

### Fase 3: vídeo e comunidades

- YouTube: inscrições, vídeos e comentários.
- Reddit: listings, votos e comentários.
- Player unificado e normalização de métricas.

### Fase 4: parcerias

- Instagram, TikTok, X e Threads somente com acesso oficial adequado.
- Revisão jurídica dos termos de cada integração.
- Monitoramento de cotas, erros e revogação de tokens.

## Mapeamento no código

- `src/constants/networks.ts`: disponibilidade, recursos e modo de conexão por rede.
- `src/lib/demo/data.ts`: posts demonstrativos normalizados.
- `src/lib/supabase/repository.ts`: leitura e escrita no Supabase.
- `src/app/settings/connected.tsx`: conexão e desconexão simuladas.
- `docs/arquitetura.md`: fluxo completo e limites de segurança.
