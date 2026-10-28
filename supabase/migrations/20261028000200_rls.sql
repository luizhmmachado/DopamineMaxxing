-- Row Level Security: cada usuário acessa apenas os próprios dados.
-- Nenhuma política permite insert/update/delete em posts: o feed é populado
-- exclusivamente por funções security definer (seed/integrações server-side).

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.consents enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.post_interactions enable row level security;
alter table public.comments enable row level security;
alter table public.data_requests enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_settings
create policy user_settings_select_own on public.user_settings
  for select to authenticated
  using (auth.uid() = user_id);

create policy user_settings_insert_own on public.user_settings
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy user_settings_update_own on public.user_settings
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- consents
create policy consents_select_own on public.consents
  for select to authenticated
  using (auth.uid() = user_id);

create policy consents_insert_own on public.consents
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy consents_update_own on public.consents
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- connected_accounts
create policy connected_accounts_select_own on public.connected_accounts
  for select to authenticated
  using (auth.uid() = user_id);

create policy connected_accounts_insert_own on public.connected_accounts
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy connected_accounts_update_own on public.connected_accounts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy connected_accounts_delete_own on public.connected_accounts
  for delete to authenticated
  using (auth.uid() = user_id);

-- posts: somente leitura do próprio feed
create policy posts_select_own on public.posts
  for select to authenticated
  using (auth.uid() = user_id);

-- post_interactions
create policy post_interactions_select_own on public.post_interactions
  for select to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy post_interactions_insert_own on public.post_interactions
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy post_interactions_delete_own on public.post_interactions
  for delete to authenticated
  using (auth.uid() = user_id);

-- comments
create policy comments_select_own on public.comments
  for select to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy comments_insert_own on public.comments
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy comments_update_own on public.comments
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- data_requests: leitura própria; escrita apenas via RPC security definer
create policy data_requests_select_own on public.data_requests
  for select to authenticated
  using (auth.uid() = user_id);

-- Privilégios: anon não acessa nada; authenticated passa pelas políticas.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
