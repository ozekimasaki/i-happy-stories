# 開発チーム向け技術指示書：ものがたりWeavers

## 1. 概要

本ドキュメントは、Webアプリケーション「ものがたりWeavers」の開発チーム（エンジニア）向けに、システムアーキテクチャ、使用技術スタック、および各機能の実装方針を定めるものです。

## 2. システムアーキテクチャ概要

本システムは、**Hono**フレームワークを主軸とし、単一の**Cloudflare Worker**上で動作するフルスタックアプリケーションとして構築します。

```mermaid
graph TD
    subgraph "ユーザー"
        U[Browser]
    end

    subgraph "Cloudflare Edge Network"
        A[Cloudflare Worker<br><b>Hono App</b>]
    end
    
    subgraph "外部サービス"
        S[Supabase<br>DB, Auth]
        G[Google Gemini API<br>AI]
    end

    U -- "1. ページアクセス / APIリクエスト" --> A
    A -- "パスに応じて処理を分岐" --> A
    subgraph "Hono App 内部処理"
        direction LR
        A -- "/api/*<br>APIリクエスト" --> R{API Router}
        A -- "その他のパス<br>ページアクセス" --> F[Static Asset<br>Serving<br>(Vite+React)]
    end

    R -- "2. Geminiにリクエスト" --> G
    R -- "3. Supabaseにデータ保存/取得" --> S
    R -- "4. APIレスポンス" --> U
    F -- "Reactアプリを返却" --> U
```
*   **アーキテクチャ**: 単一のHonoアプリケーションが全てのHTTPリクエストを受け取ります。パスが `/api/` から始まる場合はAPIロジックを実行し、それ以外の場合はViteでビルドされたReactのSPA（シングルページアプリケーション）を返却します。
*   **外部連携**: APIロジックは、必要に応じてSupabase（DB/認証）やGoogle Gemini API（AI処理）と通信します。

## 3. 技術スタック

*   **フルスタックフレームワーク**: **Hono**
    *   Cloudflare Workersに最適化された、軽量かつ超高速なWebフレームワーク。
    *   APIルーティングと静的ファイルの配信の両方を担います。
*   **フロントエンド**: **React (Viteを使用)**
    *   Viteをビルドツールとして採用し、Honoのバックエンドから配信されるSPAを構築します。
*   **データベース & BaaS**: **Supabase**
    *   ユーザー情報、物語データ等の永続化、およびユーザー認証に使用します。
*   **AI**: **Google Gemini API**
    *   物語生成とイラスト生成の両方に使用します。

## 4. プロジェクトセットアップと開発フロー

*   **初期セットアップ**: 以下のコマンドで、Cloudflare Workers向けのHonoプロジェクトテンプレートを使用してプロジェクトを開始します。
    ```sh
    npm create hono@latest
    # 対話形式で `cloudflare-workers` テンプレートを選択
    ```
*   **開発**: `@hono/vite-dev-server` プラグインにより、`npm run dev` コマンド一つでフロントエンドとバックエンドの統合開発サーバーが起動します。
*   **デプロイ**: `npm run deploy` コマンドで、ビルドされたアプリケーションが `wrangler` を通じてCloudflare Workerとしてデプロイされます。

## 5. AI技術とAPI連携

### 5.1. 物語生成
*   **API**: **Google Gemini API**
*   **実装**:
    *   HonoのAPIルート（例: `/api/stories`）内で、バックエンドから `@google/genai` パッケージを使ってGemini APIを呼び出します。
    *   プロンプトの具体的な内容は `ai_prompt_instruction.md` を参照してください。

### 5.2. イラスト生成
*   **API**: **Google Gemini API**
*   **方針**: MVP段階では、テキスト生成と画像生成の両方をGemini APIで完結させ、アーキテクチャをシンプルに保ちます。
*   **実装**:
    *   物語生成後に、そのテキストを基にイラスト生成用のプロンプトを組み立て、再度Gemini APIにリクエストを送信します。
    *   **キャラクターの一貫性（最重要課題）**: Gemini APIのマルチモーダルプロンプト機能（プロンプトに参照画像を添付する等）を活用し、キャラクターの一貫性を担保する方法を最優先で技術検証（R&D）してください。

### 5.3. 音声生成
*   **状況**: **初期リリースでは実装しません。** 将来的なロードマップ上の機能とします。

## 6. ホスティング・デプロイ戦略

*   **ホスティング**: **Cloudflare Workers**
*   **CI/CD**: GitHubリポジトリとCloudflareを連携させることで、mainブランチへのプッシュをトリガーに自動デプロイを構成します。
*   **環境変数**: APIキーなどの秘匿情報は、WranglerのSecret機能を使って安全に管理します。ローカル開発では `.dev.vars` ファイルを使用します。

## 7. その他

### 7.1. プロンプト管理

*   **状況**: **初期リリースでは特定のフレームワークを導入しません。**
*   **方針**: まずはバックエンドのコード内でプロンプトを管理・構築します。将来的、プロンプトの複雑性が増した場合に、`BoundaryML/baml` のような専門の管理フレームワークの導入を再検討します。

### 7.2. プリントオンデマンド（POD）

*   **状況**: PODは主要な収益源の一つですが、初期リリースに含めるかは別途判断します。
*   **技術調査**: バックエンドからAPI経由で印刷データ（PDFなど）を入稿できるPODサービス（例: [SUZURI API](https://suzuri.jp/developer), [Canvath API](https://canvath.jp/docs/api/) など）の調査が必要です。海外サービス（Printful, Printify）も視野に入れます。

### 7.3. 倫理的・セキュリティ要件

*   ユーザーから預かるすべてのデータ（特に子どもの名前、写真、家庭内の出来事）は、細心の注意を払って取り扱ってください。
*   Supabaseの行単位セキュリティ（Row Level Security）を適切に設定し、ユーザーが他人のデータにアクセスできないように徹底してください。
*   APIキーなどの秘匿情報は、環境変数などを用いて安全に管理してください。 