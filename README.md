# I Happy Stories

**毎日の奮闘を、親子の絆の物語へ。**

『I Happy Stories』は、ユーザーの心の内にある出来事や感情を、AIとの対話を通じて、美しいイラストと優しい読み聞かせ音声付きのデジタル絵本へと変換する、セラピューティック・ストーリーテリング・プラットフォームです。

## 🌟 コンセプト

このプロジェクトは、「愛とAI」をテーマに、育児の葛藤、感謝の気持ち、日常のささやかな喜びといった、形にならないユーザーの「想い」を、AIをパートナーとして物語という形にすることで、自己理解を深め、大切な人との絆を育むことを目指しています。

心理療法の一種であるナラティブセラピーのアプローチを参考に、ユーザーが自身の体験を肯定的に再定義（リフレーミング）する手助けをします。

## 🏛️ アーキテクチャ

本プロジェクトは、フロントエンドとバックエンドを明確に分離した**「静的SPA + サーバーレスAPI」**アーキテクチャを採用しています。インフラはすべて**Cloudflare**のプラットフォーム上で構築されており、高いパフォーマンスとスケーラビリティ、そして優れた開発者体験を実現しています。

1.  **フロントエンド (React / Vite)**
    *   UIは**React**と**Vite**で構築されたシングルページアプリケーション（SPA）です。
    *   ビルドされた静的ファイル（HTML, JS, CSS）は**Cloudflare Pages**からグローバルCDNを通じて高速に配信されます。

2.  **バックエンド (Hono / Cloudflare Workers)**
    *   APIは、Cloudflare Workers上で動作する超高速Webフレームワーク**Hono**で構築されています。
    *   物語生成、AIとの連携、データベース通信などのコアロジックは、すべてサーバーレス関数として実行されます。

3.  **データベース & ストレージ (Supabase)**
    *   ユーザー情報、生成された物語のデータは**Supabase**（PostgreSQL）に保存されます。
    *   ユーザー認証（Auth）や、生成されたイラスト・音声ファイルの保存（Storage）もSupabaseが担います。

4.  **AI (Google Gemini)**
    *   物語の生成、イラスト生成用プロンプトの作成、テキストからの音声合成（TTS）には、**Google Gemini API**を一貫して使用しています。

## 🛠️ 技術スタック

### フロントエンド

| カテゴリ | 技術 | 概要 |
| :--- | :--- | :--- |
| **フレームワーク** | [**React**](https://react.dev/) ([v19](https://react.dev/blog/2024/04/25/react-v19)) | UI構築のコアライブラリ。 |
| **ビルドツール** | [**Vite**](https://vitejs.dev/) | 高速な開発サーバーと最適化されたビルドを提供。 |
| **ルーティング** | [**React Router**](https://reactrouter.com/) | SPA内のページ遷移を管理。 |
| **スタイリング** | [**Tailwind CSS**](https://tailwindcss.com/) | ユーティリティファーストのCSSフレームワーク。 |
| **状態管理** | [**Zustand**](https://zustand-demo.pmnd.rs/) | シンプルで強力な状態管理ライブラリ。 |
| **フォーム** | [**React Hook Form**](https://react-hook-form.com/) | パフォーマンスの高いフォーム管理。 |
| **スキーマ検証** | [**Zod**](https://zod.dev/) | TypeScriptファーストのスキーマ定義・検証ライブラリ。 |
| **言語** | [**TypeScript**](https://www.typescriptlang.org/) | 静的型付けによる堅牢な開発。 |

### バックエンド & インフラ

| カテゴリ | 技術 | 概要 |
| :--- | :--- | :--- |
| **実行環境** | [**Cloudflare Workers**](https://workers.cloudflare.com/) | サーバーレス・エッジコンピューティング環境。 |
| **Webフレームワーク**| [**Hono**](https://hono.dev/) | Workers上で動作する、高速で軽量なWebフレームワーク。 |
| **データベース** | [**Supabase (Postgres)**](https://supabase.com/) | BaaS。DB、認証、ストレージ機能を提供。 |
| **AIモデル** | [**Google Gemini**](https://ai.google.dev/) | 物語生成、プロンプト作成、音声合成（TTS）を担当。 |
| **デプロイ** | [**Cloudflare Workers**](https://pages.cloudflare.com/) | 静的サイトのホスティングとWorkersのデプロイを統合。 |
| **CLI** | [**Wrangler**](https://developers.cloudflare.com/workers/wrangler/) | Cloudflare開発用のコマンドラインツール。 |

## 🧠 コアAIロジック

本サービスの心臓部であるAIによる物語生成は、`src/services/storyService.ts`内のプロンプトエンジニアリングによって制御されています。

使用しているGeminiモデルは以下の通りです。

1.  **物語生成 (Story Generation)**
    *   使用モデル: `gemini-2.5-flash`
    *   ユーザーからの入力を基に、ナラティブセラピーの理論に基づいたプロンプトを構築。
    *   年齢、物語の長さなどのパラメータに応じて、子供が喜ぶオノマトペや優しい反復表現などをAIに指示し、感動的な物語を生成します。

2.  **イラストプロンプト生成 (Illustration Prompt Generation)**
    *   使用モデル: `gemini-2.5-flash`
    *   生成された物語から、最も感動的なシーンをAI自身が選び出します。
    *   そのシーンを基に、「現代日本の絵本」「水彩画風」といった指定のスタイルに沿った、画像生成AI（Imagen 4 Ultra: `imagen-4.0-ultra-generate-preview-06-06`）向けの英語プロンプトを詳細に生成します。

3.  **音声合成 (Audio Generation)**
    *   使用モデル: `gemini-2.5-flash-preview-tts`
    *   完成した物語のテキストを、GeminiのTTSモデルに渡します。
    *   「子供への読み聞かせ」を想定した、優しく、温かく、落ち着いたトーンの日本語音声を生成し、WAV形式で保存します。

## 🚀 セットアップと実行

### 1. 前提条件
- [Node.js](https://nodejs.org/) (v22.0.0 以上)
- [pnpm](https://pnpm.io/)

### 2. プロジェクトのクローン
```bash
git clone https://github.com/ozekimasaki/i-happy-stories.git
cd i-happy-stories
```

### 3. 依存関係のインストール
```bash
pnpm install
```

### 4. 環境変数の設定
プロジェクトルートに`.dev.vars`ファイルを作成し、`wrangler.toml`を参考に、必要な環境変数を設定してください。

```.dev.vars
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

また、`wrangler.toml`内の`vars`セクションもローカル開発用に適切に設定する必要があります。

### 5. 開発サーバーの起動
以下のコマンドで、Vite（フロントエンド）とWrangler（バックエンド）の開発サーバーを同時に起動します。

```bash
pnpm run dev:all
```

- フロントエンド: `http://localhost:5173` (Viteのデフォルト)
- バックエンドAPI: `http://localhost:8787` (Wranglerのデフォルト)

フロントエンドから`/api`へのリクエストは、Viteのプロキシ設定により自動的にバックエンド（`localhost:8787`）に転送されます。

## 📜 利用可能なスクリプト

| スクリプト | 説明 |
| :--- | :--- |
| `pnpm dev` | Vite開発サーバーを起動します。 |
| `pnpm dev:worker` | Wranglerのローカル開発サーバーを起動します。 |
| `pnpm dev:all` | ViteとWranglerを同時に起動します。 |
| `pnpm build` | 本番用にプロジェクトをビルドします。 |
| `pnpm lint` | ESLintを実行してコードを静的解析します。 |
| `pnpm typegen` | Cloudflare Workersの型定義を生成します。 |