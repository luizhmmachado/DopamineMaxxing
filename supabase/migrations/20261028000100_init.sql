-- DopamineMaxxing — schema inicial
-- Requisitos: Supabase Postgres 15+, extensão pgcrypto.
-- Todas as tabelas de dados do usuário referenciam public.profiles(id), que por sua vez
-- referencia auth.users(id) com ON DELETE CASCADE. Isso simplifica joins e garante
-- eliminação em cascata quando a conta é excluída.

create extension if not exists pgcrypto;

create type public.social_network as enum (
  'instagram',
  'youtube',
  'tiktok',
  'x',
  'threads',
  'mastodon',
  'bluesky',
  'reddit'
);

create type public.post_kind as enum ('video', 'text');

create type public.interaction_type as enum ('like', 'repost');

create type public.integration_mode as enum ('oauth', 'demo', 'manual');

create type public.consent_purpose as enum ('essential', 'personalization', 'analytics', 'location');

create type public.data_request_type as enum ('export', 'delete');

create type public.data_request_status as enum ('pending', 'processing', 'completed', 'failed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  birth_date date,
  avatar_url text,
  location_label text,
  location_consent boolean not null default false,
  onboarding_completed boolean not null default false,
  privacy_policy_version text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) between 1 and 80),
  constraint profiles_location_requires_consent
    check (location_label is null or location_consent)
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  performance_mode boolean not null default false,
  theme text not null default 'system'
    check (theme in ('system', 'light', 'dark')),
  reduced_motion boolean not null default false,
  data_saver boolean not null default false,
  autoplay boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  purpose public.consent_purpose not null,
  granted boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now(),
  unique (user_id, purpose, policy_version)
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  network public.social_network not null,
  provider_account_id text,
  username text,
  display_name text,
  avatar_url text,
  integration_mode public.integration_mode not null default 'demo',
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, network)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  network public.social_network not null,
  kind public.post_kind not null,
  source_post_id text not null,
  source_url text not null,
  author_name text not null,
  author_handle text not null,
  author_avatar_url text,
  author_verified boolean not null default false,
  caption text not null default '',
  media_url text,
  thumbnail_url text,
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  reposts_count integer not null default 0 check (reposts_count >= 0),
  posted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, network, source_post_id)
);

create table public.post_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  type public.interaction_type not null,
  created_at timestamptz not null default now(),
  unique (user_id, post_id, type)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.data_request_type not null,
  status public.data_request_status not null default 'completed',
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index posts_user_kind_posted_idx
  on public.posts (user_id, kind, posted_at desc);

create index comments_post_created_idx
  on public.comments (post_id, created_at)
  where deleted_at is null;

create index post_interactions_user_post_idx
  on public.post_interactions (user_id, post_id);

create index connected_accounts_user_idx
  on public.connected_accounts (user_id);

create index consents_user_purpose_idx
  on public.consents (user_id, purpose, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- Validação de idade (18+) e consistência de localização.
create or replace function public.validate_profile()
returns trigger
language plpgsql
as $$
begin
  if new.username is not null then
    new.username = lower(new.username);
  end if;

  if new.display_name is not null then
    new.display_name = btrim(new.display_name);
    if new.display_name = '' then
      new.display_name = null;
    end if;
  end if;

  if new.birth_date is not null then
    if new.birth_date > (current_date - interval '18 years') then
      raise exception 'É necessário ter 18 anos ou mais para usar o DopamineMaxxing.'
        using errcode = 'check_violation';
    end if;
    if new.birth_date < (current_date - interval '120 years') then
      raise exception 'Data de nascimento inválida.'
        using errcode = 'check_violation';
    end if;
  end if;

  if new.location_label is not null and not new.location_consent then
    raise exception 'Localização só pode ser armazenada com consentimento.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger profiles_validate
  before insert or update on public.profiles
  for each row execute function public.validate_profile();

-- Impede interações/comentários em posts de outro usuário, mesmo com RLS.
create or replace function public.assert_own_post()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.posts p
    where p.id = new.post_id
      and p.user_id = new.user_id
  ) then
    raise exception 'Operação permitida apenas em posts do próprio usuário.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger post_interactions_assert_owner
  before insert or update on public.post_interactions
  for each row execute function public.assert_own_post();

create trigger comments_assert_owner
  before insert or update on public.comments
  for each row execute function public.assert_own_post();

-- Mantém comments_count coerente com comentários locais.
create or replace function public.sync_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.deleted_at is null then
      update public.posts
        set comments_count = comments_count + 1
        where id = new.post_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if old.deleted_at is null and new.deleted_at is not null then
      update public.posts
        set comments_count = greatest(comments_count - 1, 0)
        where id = new.post_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.deleted_at is null then
      update public.posts
        set comments_count = greatest(comments_count - 1, 0)
        where id = old.post_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create trigger comments_sync_count
  after insert or update of deleted_at or delete on public.comments
  for each row execute function public.sync_comments_count();

-- Mantém likes_count e reposts_count coerentes com as interações do usuário.
create or replace function public.sync_interaction_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.type = 'like' then
      update public.posts
        set likes_count = likes_count + 1
        where id = new.post_id;
    elsif new.type = 'repost' then
      update public.posts
        set reposts_count = reposts_count + 1
        where id = new.post_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.type = 'like' then
      update public.posts
        set likes_count = greatest(likes_count - 1, 0)
        where id = old.post_id;
    elsif old.type = 'repost' then
      update public.posts
        set reposts_count = greatest(reposts_count - 1, 0)
        where id = old.post_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create trigger post_interactions_sync_count
  after insert or delete on public.post_interactions
  for each row execute function public.sync_interaction_count();

-- Cria perfil e preferências automaticamente no cadastro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(nullif(new.raw_user_meta_data ->> 'full_name', ''), 80),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
