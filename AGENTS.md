# AGENTS.md — I Happy Stories コーディングエージェント向けガイド

このリポジトリで作業するコーディングエージェント向けのガイドです。プロジェクト構成、実在するコマンド、コーディング規約、注意点をまとめています。ここに書かれている内容はすべて実際のコード・設定ファイル（`package.json` / `wrangler.toml` / `vite.config.ts` / `eslint.config.js` / `tsconfig.json`）に基づいています。

## プロジェクト概要

**I Happy Stories**（ものがたりWeavers）は、ユーザーの体験や感情を AI で物語・イラスト・読み聞かせ音声付きのデジタル絵本に変換する、セラピューティック・ストーリーテリング・プラットフォームです。

- **アーキテクチャ**: 静的 SPA（React + Vite）+ サーバーレス API（Hono on Cloudflare Workers）
- **データ / 認証 / ストレージ**: Supabase
- **AI**: Google Gemini（物語生成・イラストプロンプト生成・TTS）
- **非同期処理**: Cloudflare Queues（音声生成）

フロントとバックエンドは同一リポジトリ内に同居し、フロントは Cloudflare Pages 相当の静的配信、API は同じ Worker（`src/worker.ts`）が `/api` 配下で処理します。

## エントリポイント

- **フロントエンド**: `index.html` → `src/main.tsx` → `src/App.tsx`（React Router のルート定義）
- **バックエンド（Worker）**: `src/worker.ts`（`wrangler.toml` の `main`）
  - `fetch` ハンドラ: `/api` に Hono の API（`src/routes/index.ts`）をマウントし、それ以外は `dist` の静的アセット + SPA フォールバック（`index.html`）を返す
  - `queue` ハンドラ: `AUDIO_QUEUE`（`monogatari-audio-queue`）のメッセージを受け取り `processAudioGenerationTask` を実行

## ディレクトリ構成

```
src/
├── main.tsx              # React エントリ
├── App.tsx               # ルーティング定義
├── worker.ts             # Cloudflare Workers エントリ（fetch / queue）
├── pages/                # 画面コンポーネント
├── components/           # UI（layout / features / common）
├── routes/               # Hono API（index → v1 → posts / users / auth）
├── services/             # ドメインロジック（storyService, illustrationService, authService）
├── schemas/              # Zod スキーマ（storySchema）
├── middleware/           # 認証ミドルウェア（authMiddleware, optionalAuthMiddleware）
├── stores/               # Zustand（authStore, storyStore）
├── lib/                  # supabase / apiClient / geminiClient / utils
├── env.d.ts              # Vite の型
└── style.css
types/                    # 追加の型定義（worker.ts の Env / メッセージ型など）
public/                   # 静的アセット
```

API 構造は `src/routes/index.ts`（`/v1` をマウント）→ `src/routes/v1/index.ts`（`posts` / `users` / `auth` と `/me`）という階層です。エンドポイント一覧は `README.md` を参照してください。

## セットアップ

前提: Node.js `>=22.0.0`（`package.json` の `engines`、`.prototools` は `node = "~22"`）と **pnpm**（`pnpm-lock.yaml` を採用）。

```bash
pnpm install
```

環境変数（`.env.example` が必要なキーを列挙）:

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Wrangler のローカル実行では、プロジェクトルートの `.dev.vars` にこれらを設定します（`.dev.vars` / `.env` は `.gitignore` 済み。**シークレットをコミットしないこと**）。

## 主要コマンド（すべて `package.json` に実在）

```bash
pnpm dev          # Vite 開発サーバー（フロント）
pnpm dev:worker   # wrangler dev --local（Worker/API）
pnpm dev:all      # 上記2つを concurrently で同時起動
pnpm build        # tsc（型チェック, noEmit）→ vite build
pnpm preview      # ビルド済みフロントのプレビュー
pnpm lint         # eslint .
pnpm typegen      # wrangler types（worker-configuration.d.ts を生成）
```

- **開発**: 通常は `pnpm dev:all`。フロントは `http://localhost:5173`、API は `http://localhost:8787`。Vite の `server.proxy` により `/api` へのリクエストは自動で `localhost:8787` に転送されます（`vite.config.ts`）。
- **型チェック**: 独立した `typecheck` スクリプトはありません。`pnpm build` が `tsc`（`tsconfig.json` は `noEmit: true`）を実行するので、これが型チェックを兼ねます。
- **テスト**: テストフレームワーク・`test` スクリプトはこのリポジトリには存在しません（存在しないコマンドを実行しないこと）。

## コーディング規約

- **言語 / 型**: TypeScript。`tsconfig.json` は `strict: true`、`noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch` 有効。未使用変数はエラーになります（プレフィックス `_` で無視可能: ESLint の `argsIgnorePattern: "^_"`）。
- **Lint**: ESLint flat config（`eslint.config.js`）。`@typescript-eslint`、`eslint-plugin-react`（jsx-runtime）、`react-hooks`、`react-refresh` を使用。`dist` / `node_modules` / `build` / `.wrangler/` は対象外。
- **インポートエイリアス**: `@` は `src` を指す（`vite.config.ts` と `tsconfig.json` の `paths` で定義）。新規インポートは既存に倣うこと。
- **スタイリング**: Tailwind CSS v4（`@tailwindcss/vite` プラグイン、`tailwind.config.js`）。
- **状態管理**: Zustand（`src/stores`）。フォームは React Hook Form + Zod（`@hookform/resolvers`）。
- **バリデーション**: API 入力は `src/schemas` の Zod スキーマで `safeParse` し、失敗時は 400 とエラー配列を返す（`src/routes/v1/posts.ts` のパターンに倣う）。
- **API の慣習**: 認証は `authMiddleware`、公開物語も許可する取得系は `optionalAuthMiddleware`。ユーザー本人性・公開制御は Supabase の RLS に委ねる箇所がある（`posts.get('/:id')` のコメント参照）。エラーメッセージ・レスポンスは日本語。既存のエラーハンドリング（`c.json({ error }, status)`）に合わせる。
- **コメント**: 既存コードは日本語コメントが中心。周囲のスタイルに合わせ、必要最小限にとどめる。

## 注意点

- **変更は最小限・スコープを限定**: 指示された範囲のみを変更し、UI/UX デザインや依存関係のバージョンを勝手に変更しない（リポジトリの `.cursor/rules` / `.windsurfrules` でも明記されています）。
- **パッケージマネージャは pnpm**: `pnpm-lock.yaml` が正。`bun.lock` も存在しますが、ドキュメント・CI 上の標準は pnpm です。混在させないこと。
- **シークレット厳禁**: `.dev.vars` / `.env` / `.env.production` は `.gitignore` 済み。キーをコード・コミット・ログに出力しない。
- **Cloudflare 前提のコード**: `src/worker.ts` は `serveStatic` に `__STATIC_CONTENT_MANIFEST` を使い、`dist`（`pnpm build` の成果物）を配信します。ローカルで API を動かす前に必要に応じてビルドしてください。型は `pnpm typegen` で再生成できます。
- **Task Master 関連ファイル**: `.taskmaster/` や `.cursor` / `.roo` などのエージェント設定が同梱されていますが、アプリ本体のコードではありません。`CLAUDE.md` / `GEMINI.md` には Task Master のワークフロー説明が含まれます。

## 完了前チェックリスト

コードを変更したら、コミット/PR 前に最低限以下を実行してください。

```bash
pnpm lint     # 静的解析
pnpm build    # 型チェック（tsc）+ ビルド
```

いずれも実在するコマンドです。存在しないコマンド・機能を追加・記載しないでください。
