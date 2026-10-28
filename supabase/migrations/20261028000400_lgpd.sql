-- Funções de LGPD e dados de demonstração.
-- O app nunca recebe service_role. Estas funções rodam como owner (postgres),
-- com search_path fixo e validação explícita de auth.uid().

create or replace function public.current_privacy_policy_version()
returns text
language sql
immutable
as $$
  select '2026-10-28'::text;
$$;

-- Exportação completa dos dados do titular (portabilidade/access).
create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  select jsonb_build_object(
    'app', 'DopamineMaxxing',
    'exported_at', now(),
    'policy_version', public.current_privacy_policy_version(),
    'account', (
      select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at)
      from auth.users u where u.id = v_uid
    ),
    'profile', (
      select to_jsonb(p) from public.profiles p where p.id = v_uid
    ),
    'settings', (
      select to_jsonb(s) from public.user_settings s where s.user_id = v_uid
    ),
    'connections', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.connected_at)
      from public.connected_accounts c where c.user_id = v_uid
    ), '[]'::jsonb),
    'consents', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.created_at)
      from public.consents c where c.user_id = v_uid
    ), '[]'::jsonb),
    'posts', coalesce((
      select jsonb_agg(to_jsonb(p) order by p.posted_at)
      from public.posts p where p.user_id = v_uid
    ), '[]'::jsonb),
    'interactions', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.created_at)
      from public.post_interactions i where i.user_id = v_uid
    ), '[]'::jsonb),
    'comments', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.created_at)
      from public.comments c where c.user_id = v_uid
    ), '[]'::jsonb),
    'data_requests', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.requested_at)
      from public.data_requests r where r.user_id = v_uid
    ), '[]'::jsonb)
  ) into v_result;

  insert into public.data_requests (user_id, type, status, completed_at)
  values (v_uid, 'export', 'completed', now());

  return v_result;
end;
$$;

-- Eliminação da conta e de todos os dados em cascata (LGPD art. 18, VI).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

-- Purga de comentários soft-deleted após 30 dias. Pode ser agendada com pg_cron.
create or replace function public.purge_soft_deleted_comments()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.comments
  where deleted_at is not null
    and deleted_at < now() - interval '30 days';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Feed demonstrativo idempotente. Em produção, substitua por conectores oficiais
-- executados em Edge Functions com service_role.
create or replace function public.seed_demo_posts()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  insert into public.posts (
    user_id, network, kind, source_post_id, source_url,
    author_name, author_handle, author_avatar_url, author_verified,
    caption, media_url, thumbnail_url,
    likes_count, comments_count, reposts_count, posted_at
  )
  values
    (
      v_uid, 'instagram', 'video', 'demo-video-instagram-1', 'https://www.instagram.com/',
      'Lia Prado', 'liaprado', 'https://i.pravatar.cc/150?img=47', true,
      $c$Rotina de 60 segundos para começar o dia sem abrir o celular. Salva pra testar amanhã. #rotina #foco$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://picsum.photos/seed/dm-lia/720/1280',
      18420, 312, 890, now() - interval '18 minutes'
    ),
    (
      v_uid, 'tiktok', 'video', 'demo-video-tiktok-1', 'https://www.tiktok.com/',
      'Nico Alves', 'nicoalves', 'https://i.pravatar.cc/150?img=12', false,
      $c$POV: você encontrou o áudio perfeito para o próximo vídeo. #fyp #transicao$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://picsum.photos/seed/dm-nico/720/1280',
      92300, 1840, 5400, now() - interval '42 minutes'
    ),
    (
      v_uid, 'youtube', 'video', 'demo-video-youtube-1', 'https://www.youtube.com/',
      'Bia Reis', 'biareis', 'https://i.pravatar.cc/150?img=32', true,
      $c$Testei o setup mais barato possível para editar vídeo em 4K. O resultado me surpreendeu.$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://picsum.photos/seed/dm-bia/720/1280',
      5120, 208, 0, now() - interval '95 minutes'
    ),
    (
      v_uid, 'instagram', 'video', 'demo-video-instagram-2', 'https://www.instagram.com/',
      'Theo Lima', 'theolima', 'https://i.pravatar.cc/150?img=68', false,
      $c$3 lugares em São Paulo que parecem outro planeta. O terceiro é gratuito.$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://picsum.photos/seed/dm-theo/720/1280',
      26700, 402, 1200, now() - interval '140 minutes'
    ),
    (
      v_uid, 'tiktok', 'video', 'demo-video-tiktok-2', 'https://www.tiktok.com/',
      'Maya Costa', 'mayacosta', 'https://i.pravatar.cc/150?img=45', true,
      $c$Receita de 4 ingredientes que virou minha janta oficial da semana. #receitafacil$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://picsum.photos/seed/dm-maya/720/1280',
      44100, 960, 2100, now() - interval '210 minutes'
    ),
    (
      v_uid, 'youtube', 'video', 'demo-video-youtube-2', 'https://www.youtube.com/',
      'Rafa Nunes', 'rafanunes', 'https://i.pravatar.cc/150?img=15', false,
      $c$Como eu organizo meu segundo cérebro no Obsidian (sem plugins mirabolantes).$c$,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://picsum.photos/seed/dm-rafa/720/1280',
      8300, 154, 0, now() - interval '320 minutes'
    ),
    (
      v_uid, 'x', 'text', 'demo-text-x-1', 'https://x.com/',
      'Duda Martins', 'dudamartins', 'https://i.pravatar.cc/150?img=25', true,
      $c$A melhor forma de consumir redes sociais é ter um lugar só para elas. Menos abas, menos scroll acidental, mais intenção.$c$,
      null, null, 2840, 96, 412, now() - interval '12 minutes'
    ),
    (
      v_uid, 'threads', 'text', 'demo-text-threads-1', 'https://www.threads.net/',
      'Caio Ferreira', 'caioferreira', 'https://i.pravatar.cc/150?img=59', false,
      $c$Pergunta séria: vocês ainda salvam posts para ler depois ou isso virou um cemitério de boas intenções?$c$,
      null, null, 1120, 204, 58, now() - interval '36 minutes'
    ),
    (
      v_uid, 'mastodon', 'text', 'demo-text-mastodon-1', 'https://mastodon.social/',
      'Lia Prado', 'liaprado', 'https://i.pravatar.cc/150?img=47', false,
      $c$Dica para quem está construindo apps: meça o tempo até o primeiro conteúdo útil. Não é sobre abrir rápido, é sobre entregar algo rápido.$c$,
      null, null, 640, 31, 102, now() - interval '74 minutes'
    ),
    (
      v_uid, 'bluesky', 'text', 'demo-text-bluesky-1', 'https://bsky.app/',
      'Bia Reis', 'biareis.bsky.social', 'https://i.pravatar.cc/150?img=32', true,
      $c$A Internet ficou melhor quando a gente parou de tratar cada plataforma como um universo separado e começou a levar nosso contexto junto.$c$,
      null, null, 980, 47, 143, now() - interval '122 minutes'
    ),
    (
      v_uid, 'instagram', 'text', 'demo-text-instagram-1', 'https://www.instagram.com/',
      'Theo Lima', 'theolima', 'https://i.pravatar.cc/150?img=68', false,
      $c$Sobre produtividade: o melhor atalho que encontrei foi reduzir o número de decisões pequenas por dia. Roupa, café, ordem das tarefas. O cérebro agradece.$c$,
      null, null, 3470, 128, 210, now() - interval '180 minutes'
    ),
    (
      v_uid, 'x', 'text', 'demo-text-x-2', 'https://x.com/',
      'Nico Alves', 'nicoalves', 'https://i.pravatar.cc/150?img=12', false,
      $c$Todo app novo deveria ter um botão de “me mostra o que você faz em 10 segundos”. Ainda mais quando o pitch envolve cinco redes sociais.$c$,
      null, null, 1560, 82, 190, now() - interval '240 minutes'
    ),
    (
      v_uid, 'threads', 'text', 'demo-text-threads-2', 'https://www.threads.net/',
      'Maya Costa', 'mayacosta', 'https://i.pravatar.cc/150?img=45', true,
      $c$Compartilhar o mesmo vídeo em três lugares diferentes não é estratégia, é ansiedade. Escolher o formato certo para cada rede é o trabalho.$c$,
      null, null, 2260, 143, 310, now() - interval '300 minutes'
    ),
    (
      v_uid, 'mastodon', 'text', 'demo-text-mastodon-2', 'https://mastodon.social/',
      'Rafa Nunes', 'rafanunes', 'https://i.pravatar.cc/150?img=15', false,
      $c$Lembrete: você não precisa de uma API paga para validar a ideia. Comece com dados demonstrativos, valide o fluxo e depois negocie o acesso oficial.$c$,
      null, null, 410, 22, 76, now() - interval '420 minutes'
    )
  on conflict (user_id, network, source_post_id) do nothing;
end;
$$;

comment on function public.export_my_data() is
  'LGPD: exporta todos os dados do usuário autenticado em JSON e registra a solicitação.';
comment on function public.delete_my_account() is
  'LGPD: exclui a conta do usuário autenticado e todos os dados em cascata.';
comment on function public.seed_demo_posts() is
  'Popula o feed demonstrativo do usuário autenticado de forma idempotente.';
comment on function public.purge_soft_deleted_comments() is
  'Remove comentários soft-deleted há mais de 30 dias. Agende com pg_cron.';

revoke all on function public.export_my_data() from public;
revoke all on function public.delete_my_account() from public;
revoke all on function public.seed_demo_posts() from public;
revoke all on function public.purge_soft_deleted_comments() from public, anon, authenticated;

grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.seed_demo_posts() to authenticated;
