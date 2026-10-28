# Prompt de design para o Figma

Use este documento para gerar o protótipo no Figma AI, Figma Make ou para briefar um designer. O objetivo é produzir um arquivo de alta fidelidade que possa ser implementado no app sem invenção de telas fora do escopo.

## Como usar

1. Crie um arquivo novo no Figma com duas páginas: `Design System` e `App`.
2. Cole o prompt abaixo em uma ferramenta de geração ou entregue ao designer.
3. Ajuste apenas o que for necessário para a marca.
4. Exporte os frames e tokens com `npm run figma:sync`.
5. Compare o resultado com os componentes em `src/components`.

## Direção visual

- Produto mobile-first, dark-first, com aparência calma e premium.
- Fundo quase preto, superfícies em camadas, acento rosa-magenta e verde-limão.
- Tipografia limpa, sem serifa, com bastante respiro.
- Cantos arredondados, mas sem excesso de cartões flutuantes.
- Feed de vídeo imersivo, com controles discretos sobre o vídeo.
- Feed de texto legível, com hierarquia clara e ações compactas.
- Nada de gradientes chamativos, sombras pesadas ou estética de cassino.
- Não usar logotipos reais das redes sociais. Criar ícones abstratos, sem logotipos, com o nome da rede ao lado.

## Tokens

### Cores

| Token | Escuro | Claro |
| --- | --- | --- |
| background | #08080B | #F7F7FA |
| surface | #15151D | #FFFFFF |
| surfaceAlt | #1D1D28 | #EEEFF4 |
| border | #2A2A38 | #E0E1E9 |
| text | #F6F6F8 | #111118 |
| textSecondary | #A3A3B4 | #5B5B6B |
| textMuted | #6F6F82 | #8A8A99 |
| primary | #FF2E88 | #D6006E |
| primarySoft | #3A1025 | #FFE3F0 |
| accent | #B6FF3B | #5C8A00 |
| accentSoft | #1F2A0B | #EDF7D2 |
| danger | #FB7185 | #DC2626 |
| warning | #FBBF24 | #B45309 |

### Tipografia

- Família: Inter ou fonte do sistema.
- Display: 32/38, peso 700.
- Título: 24/30, peso 700.
- Subtítulo: 20/26, peso 600.
- Corpo: 15/22, peso 400.
- Corpo forte: 15/22, peso 600.
- Legenda: 12/16, peso 500.
- Micro: 11/14, peso 500.

### Espaçamento e raio

- Espaçamento: 4, 8, 12, 16, 20, 24, 32.
- Raio: 12 para inputs, 16 para cards, 20 para botões e sheets, 28 para modais.
- Toque mínimo: 44 x 44.
- Margem lateral: 20.
- Safe area superior e inferior respeitadas.

## Componentes obrigatórios

Crie uma página `Design System` com variantes:

1. `AppText`: display, title, subtitle, body, bodyStrong, caption, micro; cores padrão, secundária, muted, accent, danger.
2. `Button`: primary, secondary, ghost, danger; default, pressed, disabled, loading; com ícone à esquerda.
3. `TextField`: default, focused, error, disabled; label, hint, error, ícone.
4. `Card`: superfície, borda, padding 16.
5. `Avatar`: 24, 32, 40, 48, 64; fallback com iniciais.
6. `NetworkBadge`: ícone abstrato + nome; variantes compacta e completa.
7. `FeedActions`: curtir, comentar, repostar, compartilhar; estados ativo/inativo; contadores.
8. `VideoFeedItem`: vídeo em tela cheia, gradiente inferior, autor, legenda, ações laterais, botão de mudo, pausa.
9. `TextFeedItem`: card de texto com autor, rede, legenda, mídia opcional, ações.
10. `ShareSheet`: bottom sheet com compartilhar nativo, WhatsApp, abrir original, cancelar.
11. `SettingsGroup` e `SettingsRow`: ícone, título, subtítulo, valor, chevron ou switch.
12. `EmptyState`: ícone, título, descrição, ação.
13. `LoadingView`: spinner e texto.
14. `ScreenHeader`: voltar, título, subtítulo, ação opcional.

## Telas e frames

Crie frames de 390 x 844 para iOS e 360 x 800 para Android. Use Auto Layout em todos os frames.

### 1. Welcome

- Logo abstrato, nome DopamineMaxxing.
- Headline: "Um feed. Todas as redes."
- Subheadline curta sobre intenção e menos scroll.
- Botão primário "Criar conta".
- Botão secundário "Entrar".
- Link "Explorar demonstração".
- Rodapé com aviso de modo demonstração e restrição 18+.

### 2. Sign in

- Título "Entrar".
- Campos de e-mail e senha.
- Botão "Entrar".
- Link para criar conta.

### 3. Sign up

- Título "Criar conta".
- E-mail, senha e confirmação.
- Checkbox de termos e privacidade com link para Termos e Política.
- Aviso de 18+.
- Botão "Criar conta".
- Link para entrar.

### 4. Onboarding: conectar redes

- Título "Conecte suas redes".
- Explicação honesta: algumas redes são simuladas por limitação de API.
- Lista de redes com status "Disponível", "Limitado" ou "Demonstração".
- Ações "Conectar" e "Continuar".
- Rodapé com contagem de redes selecionadas.

### 5. Onboarding: perfil

- Avatar com botão de câmera.
- Nome, username.
- Data de nascimento com máscara DD/MM/AAAA.
- Localização opcional com switch de consentimento.
- Termos de uso, personalização e métricas anônimas opcionais.
- Botão "Concluir".

### 6. Feed de vídeos

- Frame imersivo, fundo preto.
- Vídeo vertical ocupando a tela útil.
- Topo: badge da rede e botão de mudo.
- Lateral direita: curtir, comentar, repostar e compartilhar.
- Rodapé: autor, legenda com 2 linhas, áudio opcional.
- Indicador sutil de "modo desempenho" quando ativo.
- Estados: carregando, vazio, erro, pausado.

### 7. Feed de textos

- Header "Textos" com filtros por rede em chips horizontais.
- Cards com autor, badge da rede, texto, mídia opcional e ações.
- Pull to refresh.
- Estados: carregando, vazio, erro.

### 8. Perfil

- Header com botão "Editar".
- Avatar, nome e @username.
- Estatísticas: redes conectadas, perfil privado e LGPD.
- Lista de redes conectadas.
- Card de privacidade com atalho para a central LGPD.

### 9. Configurações

- Perfil resumido no topo.
- Grupos:
  - Experiência: modo desempenho, autoplay, economia de dados, reduzir animações e tema.
  - Conta: editar perfil, redes conectadas e sair.
  - Privacidade e LGPD: consentimentos, exportação, política e termos.
  - Sobre: versão, stack, limitações de API.
- Botões "Exportar meus dados", "Excluir conta" e "Sair".

### 10. Editar perfil

- Avatar, nome, username, data de nascimento e localização.
- Botão "Salvar alterações" ao final do formulário.
- Estados de erro por campo.

### 11. Redes conectadas

- Lista com todas as redes.
- Status de conexão, modo (real/simulado), disponibilidade.
- Ação conectar/desconectar.
- Aviso sobre tokens e APIs.

### 12. Privacidade e LGPD

- Explicação curta.
- Switches de personalização, métricas e localização.
- Bloco de direitos do titular.
- Links para política e exclusão.

### 13. Política de privacidade

- Texto longo com títulos e parágrafos.
- Versão e data.
- Botão para voltar.

### 14. Sobre

- Versão do app.
- Stack.
- Matriz resumida de compatibilidade das redes.
- Aviso de que o app não faz scraping.

### 15. Comentários

- Header com voltar e título.
- Prévia do post no topo.
- Lista de comentários.
- Composer fixo no rodapé com avatar, campo e botão enviar.
- Estado vazio e estado de envio.

### 16. Not found

- Ícone, mensagem e botão "Voltar ao feed".

## Navegação

- Stack raiz: index, auth, onboarding, tabs, post, settings.
- Tabs: Vídeos, Textos, Perfil, Ajustes.
- Transições suaves; no modo desempenho, sem animação.
- Bottom tabs com ícones preenchidos quando ativos.
- O feed de vídeos não deve mostrar header convencional.

## Conteúdo de exemplo

Use nomes fictícios e mídia placeholder:

- Lia Prado, @liaprado, Instagram.
- Nico Alves, @nicoalves, TikTok.
- Bia Reis, @biareis, YouTube.
- Theo Lima, @theolima, Instagram.
- Maya Costa, @mayacosta, TikTok.
- Rafa Nunes, @rafanunes, YouTube.
- Duda Martins, @dudamartins, X.
- Caio Ferreira, @caioferreira, Threads.

Legendas em português, curtas, com hashtags ocasionais. Não usar fotos de pessoas reais; use retratos abstratos ou placeholders.

## Acessibilidade

- Contraste mínimo AA.
- Áreas de toque de 44 x 44.
- Labels descritivos em ícones.
- Não depender apenas de cor para estados.
- Suportar fonte dinâmica sem quebrar layouts.
- Indicar estado de reprodução e mudo.
- Textos de erro claros e associados aos campos.

## Protótipo

Conecte pelo menos estes fluxos:

1. Welcome -> Sign up -> Onboarding -> Vídeos.
2. Welcome -> Sign in -> Vídeos.
3. Welcome -> Demo -> Vídeos.
4. Vídeos -> Comentários -> Voltar.
5. Textos -> Comentários -> Voltar.
6. Perfil -> Editar perfil -> Salvar.
7. Ajustes -> Redes conectadas -> Conectar/Desconectar.
8. Ajustes -> Privacidade -> Política.
9. Ajustes -> Excluir conta -> Confirmação.

## Entregáveis

- Página `Design System` com tokens e componentes.
- Página `App` com todos os frames.
- Variantes de tema claro e escuro.
- Estados de loading, vazio, erro e sucesso.
- Protótipo navegável.
- Nomes de frames e componentes em inglês, textos em português.

## Prompt para colar

```text
Crie um app móvel chamado DopamineMaxxing, para iOS e Android, que reúne feeds de várias redes sociais em um só lugar. O design deve ser dark-first, calmo, premium e minimalista, com fundo #08080B, superfícies #15151D e #1D1D28, texto #F6F6F8, acento rosa-magenta #FF2E88 e verde-limão #B6FF3B. Use Inter ou fonte do sistema, cantos arredondados, Auto Layout, margem lateral de 20 px e áreas de toque de 44 px.

Crie uma página de Design System com tokens de cor, tipografia, espaçamento, raio e componentes: AppText, Button, TextField, Card, Avatar, NetworkBadge, FeedActions, VideoFeedItem, TextFeedItem, ShareSheet, SettingsGroup, SettingsRow, EmptyState, LoadingView e ScreenHeader. Inclua variantes de tema claro e escuro e estados default, pressed, disabled, loading, error e active.

Crie frames de 390x844 para iOS e 360x800 para Android para as telas: Welcome, Sign in, Sign up, Onboarding de conexões, Onboarding de perfil, Feed de vídeos, Feed de textos, Perfil, Configurações, Editar perfil, Redes conectadas, Privacidade e LGPD, Política de privacidade, Sobre, Comentários e Not found.

O feed de vídeos deve ser imersivo, com vídeo vertical em tela cheia, gradiente inferior, badge da rede, autor, legenda, ações laterais de curtir, comentar, repostar, compartilhar e mudo. O feed de textos deve ter chips de filtro por rede e cards legíveis. O onboarding deve explicar com honestidade que Instagram, TikTok, X e Threads não têm API gratuita para feed pessoal e aparecem como demonstração; Mastodon e Bluesky são viáveis; YouTube e Reddit são limitados.

Use nomes fictícios: Lia Prado, Nico Alves, Bia Reis, Theo Lima, Maya Costa, Rafa Nunes, Duda Martins e Caio Ferreira. Não use logotipos reais; crie ícones abstratos, sem logotipos, com o nome da rede ao lado. Todos os textos devem estar em português do Brasil. Inclua estados de loading, vazio, erro e sucesso, e um protótipo navegável com os fluxos de cadastro, login, demo, comentários, edição de perfil, conexões, privacidade e exclusão de conta. Garanta contraste AA, labels em ícones e suporte a fonte dinâmica.
```

## Critérios de aceite

- Todos os frames usam os mesmos tokens.
- Nenhum texto fora do português, exceto nomes de componentes.
- Nenhum logotipo real de rede social.
- Todos os botões têm estados default, pressed, disabled e loading.
- O feed de vídeos funciona em 390x844 e 360x800 sem cortar ações.
- O composer de comentários permanece visível com o teclado aberto.
- As telas de erro e vazio existem para os dois feeds.
- O protótipo cobre os nove fluxos listados.
