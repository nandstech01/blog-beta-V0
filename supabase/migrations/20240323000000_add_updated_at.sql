-- updated_at カラムの追加
alter table articles
add column updated_at timestamp with time zone default now();

-- インデックスの作成
create index articles_updated_at_idx on articles(updated_at desc);

-- トリガー関数の作成
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- トリガーの作成
create trigger update_articles_updated_at
    before update on articles
    for each row
    execute function update_updated_at_column(); 