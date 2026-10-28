# LGPD e privacidade

Este documento descreve como o DopamineMaxxing trata dados pessoais e como o app implementa os direitos da Lei Geral de Proteção de Dados (Lei 13.709/2018). Ele é um guia técnico e de produto, não parecer jurídico. Antes de publicar, revise com assessoria jurídica e preencha os dados do controlador.

## Papéis

- Controlador: responsável pelo app e pelas decisões de tratamento. Preencher razão social, CNPJ, endereço e contato.
- Operadores: Supabase (banco, auth e storage), Expo/EAS (build e atualizações), provedores de e-mail e lojas de aplicativos.
- Encarregado (DPO): preencher nome e canal de contato antes da publicação.

## Princípios adotados

- Minimização: coletar apenas o necessário para autenticar, montar o feed, permitir interações e cumprir obrigações.
- Finalidade: cada dado tem uma finalidade documentada.
- Transparência: política no app e consentimentos granulares.
- Segurança: RLS, bucket privado, URLs assinadas, tokens fora do cliente.
- Prestação de contas: exportação, exclusão e registro de solicitações.
- Não discriminação: funcionalidades essenciais não dependem de consentimentos opcionais.

## Mapa de dados

| Dado | Origem | Finalidade | Base legal | Retenção |
| --- | --- | --- | --- | --- |
| E-mail | Cadastro | Autenticação, segurança e comunicação transacional | Execução de contrato | Enquanto a conta existir |
| Senha | Cadastro | Autenticação | Execução de contrato | Hash gerenciado pelo Supabase |
| Nome e username | Onboarding/perfil | Identificação no app | Execução de contrato | Enquanto a conta existir |
| Bio | Perfil | Personalização do perfil | Consentimento/execução | Até edição ou exclusão |
| Avatar | Upload opcional | Identificação visual | Consentimento | Até troca ou exclusão |
| Data de nascimento | Onboarding | Verificação de 18+ | Obrigação legal/segurança | Enquanto a conta existir |
| Localização aproximada | Consentimento opcional | Personalização do perfil | Consentimento | Até revogação ou exclusão |
| Redes conectadas | Onboarding | Montar o feed | Execução de contrato | Até desconexão ou exclusão |
| Consentimentos | Onboarding/privacidade | Registrar escolhas | Obrigação legal | Enquanto a conta existir |
| Posts em cache | Feed | Exibir conteúdo | Execução de contrato | Enquanto necessário ao feed |
| Curtidas/reposts | Interações | Personalizar e exibir estado | Execução de contrato | Até remoção ou exclusão |
| Comentários | Interações | Comunicação social | Execução de contrato | Até exclusão; soft delete por 30 dias |
| Solicitações LGPD | Privacidade | Atender direitos | Obrigação legal | 5 anos ou prazo legal aplicável |
| Métricas anônimas | Opt-in | Melhorar o app | Consentimento | Agregadas, sem identificação |

## Finalidades e bases legais

- Execução de contrato: criar conta, autenticar, manter perfil, exibir feed, permitir interações e comentários.
- Consentimento: personalização, métricas anônimas e localização.
- Obrigação legal: verificação de idade, registros de consentimento e atendimento de solicitações.
- Legítimo interesse: segurança, prevenção a fraude e melhoria do serviço, sempre com avaliação de impacto e possibilidade de oposição.

## Consentimentos

O app registra a versão da política (`2026-10-28`) e o estado de cada finalidade:

- `essential`: sempre ativo; necessário para autenticação e segurança.
- `personalization`: usa interações para ordenar o feed.
- `analytics`: métricas anônimas para melhorar o produto.
- `location`: grava localização aproximada no perfil.

O usuário pode revogar consentimentos opcionais em Ajustes > Privacidade. A revogação não impede o uso das funções essenciais.

## Direitos do titular

O app oferece ou documenta:

1. Confirmação da existência de tratamento.
2. Acesso aos dados.
3. Correção de dados incompletos ou desatualizados.
4. Anonimização, bloqueio ou eliminação de dados desnecessários.
5. Portabilidade.
6. Eliminação de dados tratados com consentimento.
7. Informação sobre compartilhamento.
8. Revogação do consentimento.

### Exportação

A função `public.export_my_data()` retorna um JSON com conta (e-mail), perfil, configurações, conexões, consentimentos, posts, interações, comentários e solicitações. O app compartilha o JSON pelo share sheet do sistema. A exportação também registra uma solicitação do tipo `export`.

### Exclusão

A função `public.delete_my_account()` remove o registro em `auth.users`. As tabelas de domínio referenciam `profiles(id)` com `on delete cascade`, então perfil, configurações, conexões, consentimentos, posts, interações, comentários e solicitações são removidos. Avatares no Storage são tratados pelo fluxo de exclusão; o app tenta listar e apagar todos os arquivos da pasta do usuário antes de excluir a conta.

A exclusão é irreversível. O app pede confirmação explícita em um diálogo destrutivo antes de executar.

## Retenção

- Conta e perfil: enquanto a conta existir.
- Comentários excluídos: 30 dias em soft delete, depois purga.
- Solicitações LGPD: 5 anos ou prazo legal aplicável.
- Logs de segurança: mínimo necessário, com acesso restrito.
- Backups: conforme política do Supabase; documentar o prazo do plano contratado.
- Métricas anônimas: agregadas, sem retenção de identificadores.

## Compartilhamento

- Supabase: hospedagem de banco, autenticação e storage.
- Expo/EAS: build, atualizações e telemetria do serviço.
- Lojas: distribuição e dados de instalação.
- Provedores de redes sociais: somente se o usuário conectar uma conta e conforme a API oficial.
- Autoridades: mediante obrigação legal.

Não há venda de dados. Não há compartilhamento com anunciantes no estado atual.

## Transferência internacional

Supabase, Expo e lojas podem processar dados fora do Brasil. Escolha regiões e contratos que ofereçam garantias adequadas. Documente a base legal e os mecanismos de transferência no contrato e na política.

## Segurança

- RLS em todas as tabelas de domínio.
- Funções `security definer` com `search_path` fixo.
- Bucket de avatares privado, limite de 2 MB e MIME types restritos.
- URLs assinadas com expiração de 1 hora.
- Sessão em SecureStore, com fallback para AsyncStorage.
- Nenhum token de rede social no cliente.
- Princípio do menor privilégio para chaves e funções.
- Revisão de dependências e atualizações regulares.
- Não registrar senhas, tokens ou dados sensíveis em logs.

## Incidentes

1. Detectar e conter o incidente.
2. Avaliar risco aos titulares.
3. Registrar escopo, causa, dados afetados e medidas.
4. Comunicar a ANPD e os titulares quando houver risco relevante, nos prazos aplicáveis.
5. Corrigir a causa e revisar controles.
6. Manter canal de contato para dúvidas.

## Crianças e adolescentes

O app é destinado a maiores de 18 anos. A data de nascimento é validada no onboarding e o cadastro é bloqueado para menores. Se houver indício de conta de menor, o fluxo deve ser suspenso e os dados tratados conforme a lei.

## Cookies e rastreamento

O app não usa cookies de navegador. Não há rastreamento publicitário. Métricas anônimas são opt-in e devem ser agregadas. Se ferramentas de analytics forem adicionadas, atualizar a política e o consentimento.

## Transparência nas lojas

Preencha:

- App Store Privacy Nutrition Label: dados coletados, vinculados ao usuário, rastreamento.
- Google Play Data Safety: coleta, compartilhamento, segurança e exclusão.
- Política de privacidade pública acessível na loja e no app.

## Contato

Substituir antes da publicação:

- Controlador: [razão social], CNPJ [ ], endereço [ ].
- Encarregado: [nome], e-mail [dpo@exemplo.com].
- Canal de suporte: [suporte@exemplo.com].

## Implementação no código

- `supabase/migrations/20261028000400_lgpd.sql`: exportação, exclusão, purga e seed.
- `supabase/migrations/20261028000200_rls.sql`: RLS.
- `src/app/settings/privacy.tsx`: consentimentos e direitos.
- `src/app/settings/privacy-policy.tsx`: política no app.
- `src/lib/validation.ts`: versão da política.
- `src/lib/supabase/repository.ts`: RPCs de exportação e exclusão.
