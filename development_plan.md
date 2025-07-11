# 開発計画書：ものがたりWeavers (v2)

## 1. 基本アーキテクチャ

本プロジェクトは、以下の技術構成を採用する。

-   **フロントエンド**: React (Vite)
    -   静的なHTML, CSS, JSを生成するシングルページアプリケーション(SPA)。
    -   Cloudflare Pagesによってホスティング・CDN配信される。
-   **バックエンド**: Hono
    -   `/api/*` のリクエストを処理するサーバーレスAPI。
    -   Cloudflare Pages Functionsの機能を利用してデプロイ・実行される。
-   **目的**: フロントエンドとバックエンドの責務を完全に分離し、シンプルで堅牢な構成を実現する。

## 2. 開発エピック（大きなタスク群）

開発は以下の4つの大きなエピックに分けて進める。

### エピック1：プロジェクト基盤の再構築

**ゴール**: `pnpm dev`でフロントとバックエンドが連携して動作する、クリーンな開発環境を構築する。

-   **1-1. Vite (React) プロジェクトの初期化**:
    -   `src`ディレクトリをフロントエンドのルートとする。
    -   `pnpm create vite . --template react-ts` を参考に、既存の `package.json` にViteとReact関連の設定を統合する。
    -   `index.html`をプロジェクトルートに配置し、`src/main.tsx`をエントリーポイントとする。
-   **1-2. Hono API の雛形作成**:
    -   `functions/api`ディレクトリをバックエンドのルートとする。
    -   `[[path]].ts` を作成し、すべての `/api/*` リクエストを処理するHonoアプリケーションを配置する。
-   **1-3. 開発サーバーの連携設定**:
    -   Viteの開発サーバーが、`/api/*`へのリクエストをCloudflare Workersの開発サーバー（`wrangler dev`）にプロキシするように`vite.config.ts`を設定する。
    -   `package.json` の `dev` スクリプトを修正し、`concurrently` などを用いて一声でフロントとバックの両開発サーバーが起動するようにする。
-   **1-4. 環境変数管理**:
    -   フロントエンド用に `.env` (`VITE_`プレフィックス付き変数)。
    -   バックエンド用に `.dev.vars`。
    -   両方の設定を整備する。

### エピック2：バックエンドAPIの実装 (Hono)

**ゴール**: ユーザー認証と、物語生成のスタブAPIを実装し、テスト可能な状態にする。

-   **2-1. Supabaseクライアント設定**:
    -   `functions`内にSupabaseクライアントを初期化するコードを配置する。
-   **2-2. 認証APIの実装**:
    -   `POST /api/signup` と `POST /api/login` を実装する。
    -   Zodによるリクエストバリデーションを導入する。
-   **2-3. 認証ミドルウェアの実装**:
    -   JWTトークンを検証し、保護されたルートを実現するHonoミドルウェアを作成する。
-   **2-4. スタブAPIの作成**:
    -   物語生成 `POST /api/stories` と、結果取得 `GET /api/stories/:id` のエンドポイントを作成する。
    -   認証ミドルウェアを適用し、成功時にはダミーのJSONデータを返すように実装する。

### エピック3：フロントエンドUIの実装 (React)

**ゴール**: 全ての画面のコンポーネントを作成し、認証機能とルーティングを実装する。

-   **3-1. ルーティング設定**:
    -   `react-router-dom` を導入し、各ページ（トップ、ログイン、サインアップ、入力、結果表示）へのルートを定義する。
    -   ログイン状態によって表示を切り替える保護ルート（Protected Route）を実装する。
-   **3-2. 状態管理とSupabaseクライアント**:
    -   ユーザーの認証状態（ログインしているか、ユーザー情報は何か）を管理する仕組みをContext API等で実装する。
    -   フロントエンド用のSupabaseクライアントを初期化し、状態管理と連携させる。
-   **3-3. UIコンポーネント作成**:
    -   各ページのUIコンポーネントを作成する（スタイルは後回しで機能優先）。
    -   ログイン・サインアップフォームを作成し、APIを叩いて認証状態が変化することを実装する。

### エピック4：コア機能の連携と完成

**ゴール**: 物語生成のロジックを実装し、フロントとバックを連携させてアプリケーションを完成させる。

-   **4-1. 物語生成APIの本格実装**:
    -   `POST /api/stories` にGoogle Gemini APIを連携させ、実際に物語を生成するロジックを実装する。
    -   生成結果をSupabaseに保存する処理を実装する。
-   **4-2. フロントエンドとの連携**:
    -   入力フォームから`POST /api/stories`を呼び出す。
    -   APIから返却されたIDを基に結果ページに遷移し、`GET /api/stories/:id`を呼び出して結果を表示する。
-   **4-3. イラスト生成機能の実装**:
    -   物語文からイラストを生成するロジックをAPI側に追加する。
-   **4-4. スタイリングと仕上げ**:
    -   全体の見た目を整える。 