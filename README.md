# 労働問題解決ガイド-beta

労働問題に関する情報を提供する記事生成システムです。AI技術を活用して、労働問題の解決方法や対処法を分かりやすく解説します。

## 機能

- AI による労働問題解決記事の自動生成
- 記事のアウトライン生成と構造化
- 管理画面での記事管理
- 記事の状態管理（生成中、完了、エラー）
- カテゴリー別の記事整理

## 記事カテゴリー

- 労働トラブル事例
- メンタルヘルス
- 法的対応
- 職場環境改善
- カャリア相談

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Upstash Redis
- Claude AI (Anthropic)

## 環境変数

以下の環境変数が必要です：

```env
ANTHROPIC_API_KEY=your_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番環境の起動
npm start
```

## デプロイ

Vercel へのデプロイをサポートしています：

```bash
vercel deploy --prod
```
