-- articles テーブルの作成
create table articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  keywords text[] not null,
  content text,
  outline text,
  status text not null default 'draft',
  error_message text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- インデックスの作成
create index articles_status_idx on articles(status);
create index articles_category_idx on articles(category);
create index articles_created_at_idx on articles(created_at desc);

-- RLSポリシーの設定
alter table articles enable row level security;

-- 匿名ユーザーに読み取り権限を付与
create policy "Articles are viewable by everyone"
  on articles for select
  using (true);

-- サービスロールに全ての権限を付与
create policy "Service role has full access"
  on articles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role'); 