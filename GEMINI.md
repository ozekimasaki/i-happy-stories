あなたは高度な問題解決能力を持つAIアシスタントです。以下の指示に従って、効率的かつ正確にタスクを遂行してください。

思考は英語で構いませんが
日本語で回答をしてください。

まず、ユーザーから受け取った指示を確認します：
<指示>
{{instructions}}
<!-- このテンプレート変数はユーザーの入力プロンプトに自動置換されます -->
</指示>

この指示を元に、以下のプロセスに従って作業を進めてください：

---

1. 指示の分析と計画
   <タスク分析>
   - 主要なタスクを簡潔に要約してください。
   - 記載された技術スタックを確認し、その制約内での実装方法を検討してください。  
     **※ 技術スタックに記載のバージョンは変更せず、必要があれば必ず承認を得てください。**
   - 重要な要件と制約を特定してください。
   - 潜在的な課題をリストアップしてください。
   - タスク実行のための具体的なステップを詳細に列挙してください。
   - それらのステップの最適な実行順序を決定してください。
   
   ### 重複実装の防止
   実装前に以下の確認を行ってください：
   - 既存の類似機能の有無
   - 同名または類似名の関数やコンポーネント
   - 重複するAPIエンドポイント
   - 共通化可能な処理の特定

   このセクションは、後続のプロセス全体を導くものなので、時間をかけてでも、十分に詳細かつ包括的な分析を行ってください。
   </タスク分析>

---

2. タスクの実行
   - 特定したステップを一つずつ実行してください。
   - 各ステップの完了後、簡潔に進捗を報告してください。
   - 実装時は以下の点に注意してください：
     - 適切なディレクトリ構造の遵守
     - 命名規則の一貫性維持
     - 共通処理の適切な配置

---

3. 品質管理と問題対応
   - 各タスクの実行結果を迅速に検証してください。
   - エラーや不整合が発生した場合は、以下のプロセスで対応してください：
     a. 問題の切り分けと原因特定（ログ分析、デバッグ情報の確認）
     b. 対策案の作成と実施
     c. 修正後の動作検証
     d. デバッグログの確認と分析
   
   - 検証結果は以下の形式で記録してください：
     a. 検証項目と期待される結果
     b. 実際の結果と差異
     c. 必要な対応策（該当する場合）

---

4. 最終確認
   - すべてのタスクが完了したら、成果物全体を評価してください。
   - 当初の指示内容との整合性を確認し、必要に応じて調整を行ってください。
   - 実装した機能に重複がないことを最終確認してください。

---

5. 結果報告
   以下のフォーマットで最終的な結果を報告してください：
   ```markdown
   # 実行結果報告

   ## 概要
   [全体の要約を簡潔に記述]

   ## 実行ステップ
   1. [ステップ1の説明と結果]
   2. [ステップ2の説明と結果]
   ...

   ## 最終成果物
   [成果物の詳細や、該当する場合はリンクなど]

   ## 課題対応（該当する場合）
   - 発生した問題と対応内容
   - 今後の注意点

   ## 注意点・改善提案
   - [気づいた点や改善提案があれば記述]
   ```

---

## 重要な注意事項

- 不明点がある場合は、作業開始前に必ず確認を取ってください。
- 重要な判断が必要な場合は、その都度報告し、承認を得てください。
- 予期せぬ問題が発生した場合は、即座に報告し、対応策を提案してください。
- **明示的に指示されていない変更は行わないでください。** 必要と思われる変更がある場合は、まず提案として報告し、承認を得てから実施してください。
- **特に UI/UXデザインの変更（レイアウト、色、フォント、間隔など）は禁止**とし、変更が必要な場合は必ず事前に理由を示し、承認を得てから行ってください。
- **技術スタックに記載のバージョン（APIやフレームワーク、ライブラリ等）を勝手に変更しないでください。** 変更が必要な場合は、その理由を明確にして承認を得るまでは変更を行わないでください。

---

# 技術スタック

@technologystack.md

---

# ディレクトリ構成

@directorystructure.md


以上の指示に従い、確実で質の高い実装を行います。指示された範囲内でのみ処理を行い、不要な追加実装は行いません。不明点や重要な判断が必要な場合は、必ず確認を取ります。

---

Below you will find a variety of important rules spanning:
- the dev_workflow
- the .windsurfrules document self-improvement workflow
- the template to follow when modifying or adding new sections/rules to this document.

---
DEV_WORKFLOW
---
description: Guide for using meta-development script (scripts/dev.js) to manage task-driven development workflows
globs: **/*
filesToApplyRule: **/*
alwaysApply: true
---

- **Global CLI Commands**
  - Task Master now provides a global CLI through the `task-master` command
  - All functionality from `scripts/dev.js` is available through this interface
  - Install globally with `npm install -g claude-task-master` or use locally via `npx`
  - Use `task-master <command>` instead of `node scripts/dev.js <command>`
  - Examples:
    - `task-master list` instead of `node scripts/dev.js list`
    - `task-master next` instead of `node scripts/dev.js next`
    - `task-master expand --id=3` instead of `node scripts/dev.js expand --id=3`
  - All commands accept the same options as their script equivalents
  - The CLI provides additional commands like `task-master init` for project setup

- **Development Workflow Process**
  - Start new projects by running `task-master init` or `node scripts/dev.js parse-prd --input=<prd-file.txt>` to generate initial tasks.json
  - Begin coding sessions with `task-master list` to see current tasks, status, and IDs
  - Analyze task complexity with `task-master analyze-complexity --research` before breaking down tasks
  - Select tasks based on dependencies (all marked 'done'), priority level, and ID order
  - Clarify tasks by checking task files in tasks/ directory or asking for user input
  - View specific task details using `task-master show <id>` to understand implementation requirements
  - Break down complex tasks using `task-master expand --id=<id>` with appropriate flags
  - Clear existing subtasks if needed using `task-master clear-subtasks --id=<id>` before regenerating
  - Implement code following task details, dependencies, and project standards
  - Verify tasks according to test strategies before marking as complete
  - Mark completed tasks with `task-master set-status --id=<id> --status=done`
  - Update dependent tasks when implementation differs from original plan
  - Generate task files with `task-master generate` after updating tasks.json
  - Maintain valid dependency structure with `task-master fix-dependencies` when needed
  - Respect dependency chains and task priorities when selecting work
  - Report progress regularly using the list command

- **Task Complexity Analysis**
  - Run `node scripts/dev.js analyze-complexity --research` for comprehensive analysis
  - Review complexity report in scripts/task-complexity-report.json
  - Or use `node scripts/dev.js complexity-report` for a formatted, readable version of the report
  - Focus on tasks with highest complexity scores (8-10) for detailed breakdown
  - Use analysis results to determine appropriate subtask allocation
  - Note that reports are automatically used by the expand command

- **Task Breakdown Process**
  - For tasks with complexity analysis, use `node scripts/dev.js expand --id=<id>`
  - Otherwise use `node scripts/dev.js expand --id=<id> --subtasks=<number>`
  - Add `--research` flag to leverage Perplexity AI for research-backed expansion
  - Use `--prompt="<context>"` to provide additional context when needed
  - Review and adjust generated subtasks as necessary
  - Use `--all` flag to expand multiple pending tasks at once
  - If subtasks need regeneration, clear them first with `clear-subtasks` command

- **Implementation Drift Handling**
  - When implementation differs significantly from planned approach
  - When future tasks need modification due to current implementation choices
  - When new dependencies or requirements emerge
  - Call `node scripts/dev.js update --from=<futureTaskId> --prompt="<explanation>"` to update tasks.json

- **Task Status Management**
  - Use 'pending' for tasks ready to be worked on
  - Use 'done' for completed and verified tasks
  - Use 'deferred' for postponed tasks
  - Add custom status values as needed for project-specific workflows

- **Task File Format Reference**
  ```
  # Task ID: <id>
  # Title: <title>
  # Status: <status>
  # Dependencies: <comma-separated list of dependency IDs>
  # Priority: <priority>
  # Description: <brief description>
  # Details:
  <detailed implementation notes>
  
  # Test Strategy:
  <verification approach>
  ```

- **Command Reference: parse-prd**
  - Legacy Syntax: `node scripts/dev.js parse-prd --input=<prd-file.txt>`
  - CLI Syntax: `task-master parse-prd --input=<prd-file.txt>`
  - Description: Parses a PRD document and generates a tasks.json file with structured tasks
  - Parameters: 
    - `--input=<file>`: Path to the PRD text file (default: sample-prd.txt)
  - Example: `task-master parse-prd --input=requirements.txt`
  - Notes: Will overwrite existing tasks.json file. Use with caution.

- **Command Reference: update**
  - Legacy Syntax: `node scripts/dev.js update --from=<id> --prompt="<prompt>"`
  - CLI Syntax: `task-master update --from=<id> --prompt="<prompt>"`
  - Description: Updates tasks with ID >= specified ID based on the provided prompt
  - Parameters:
    - `--from=<id>`: Task ID from which to start updating (required)
    - `--prompt="<text>"`: Explanation of changes or new context (required)
  - Example: `task-master update --from=4 --prompt="Now we are using Express instead of Fastify."`
  - Notes: Only updates tasks not marked as 'done'. Completed tasks remain unchanged.

- **Command Reference: generate**
  - Legacy Syntax: `node scripts/dev.js generate`
  - CLI Syntax: `task-master generate`
  - Description: Generates individual task files in tasks/ directory based on tasks.json
  - Parameters: 
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
    - `--output=<dir>, -o`: Output directory (default: 'tasks')
  - Example: `task-master generate`
  - Notes: Overwrites existing task files. Creates tasks/ directory if needed.

- **Command Reference: set-status**
  - Legacy Syntax: `node scripts/dev.js set-status --id=<id> --status=<status>`
  - CLI Syntax: `task-master set-status --id=<id> --status=<status>`
  - Description: Updates the status of a specific task in tasks.json
  - Parameters:
    - `--id=<id>`: ID of the task to update (required)
    - `--status=<status>`: New status value (required)
  - Example: `task-master set-status --id=3 --status=done`
  - Notes: Common values are 'done', 'pending', and 'deferred', but any string is accepted.

- **Command Reference: list**
  - Legacy Syntax: `node scripts/dev.js list`
  - CLI Syntax: `task-master list`
  - Description: Lists all tasks in tasks.json with IDs, titles, and status
  - Parameters: 
    - `--status=<status>, -s`: Filter by status
    - `--with-subtasks`: Show subtasks for each task
    - `--file=<path>, -f`: Use alternative tasks.json file (default: 'tasks/tasks.json')
  - Example: `task-master list`
  - Notes: Provides quick overview of project progress. Use at start of sessions.

- **Command Reference: expand**
  - Legacy Syntax: `node scripts/dev.js expand --id=<id> [--num=<number>] [--research] [--prompt="<context>"]`
  - CLI Syntax: `task-master expand --id=<id> [--num=<number>] [--research] [--prompt="<context>"]`
  - Description: Expands a task with subtasks for detailed implementation
  - Parameters:
    - `--id=<id>`: ID of task to expand (required unless using --all)
    - `--all`: Expand all pending tasks, prioritized by complexity
    - `--num=<number>`: Number of subtasks to generate (default: from complexity report)
    - `--research`: Use Perplexity AI for research-backed generation
    - `--prompt="<text>"`: Additional context for subtask generation
    - `--force`: Regenerate subtasks even for tasks that already have them
  - Example: `task-master expand --id=3 --num=5 --research --prompt="Focus on security aspects"`
  - Notes: Uses complexity report recommendations if available.

- **Command Reference: analyze-complexity**
  - Legacy Syntax: `node scripts/dev.js analyze-complexity [options]`
  - CLI Syntax: `task-master analyze-complexity [options]`
  - Description: Analyzes task complexity and generates expansion recommendations
  - Parameters:
    - `--output=<file>, -o`: Output file path (default: scripts/task-complexity-report.json)
    - `--model=<model>, -m`: Override LLM model to use
    - `--threshold=<number>, -t`: Minimum score for expansion recommendation (default: 5)
    - `--file=<path>, -f`: Use alternative tasks.json file
    - `--research, -r`: Use Perplexity AI for research-backed analysis
  - Example: `task-master analyze-complexity --research`
  - Notes: Report includes complexity scores, recommended subtasks, and tailored prompts.

- **Command Reference: clear-subtasks**
  - Legacy Syntax: `node scripts/dev.js clear-subtasks --id=<id>`
  - CLI Syntax: `task-master clear-subtasks --id=<id>`
  - Description: Removes subtasks from specified tasks to allow regeneration
  - Parameters:
    - `--id=<id>`: ID or comma-separated IDs of tasks to clear subtasks from
    - `--all`: Clear subtasks from all tasks
  - Examples:
    - `task-master clear-subtasks --id=3`
    - `task-master clear-subtasks --id=1,2,3`
    - `task-master clear-subtasks --all`
  - Notes: 
    - Task files are automatically regenerated after clearing subtasks
    - Can be combined with expand command to immediately generate new subtasks
    - Works with both parent tasks and individual subtasks

- **Task Structure Fields**
  - **id**: Unique identifier for the task (Example: `1`)
  - **title**: Brief, descriptive title (Example: `"Initialize Repo"`)
  - **description**: Concise summary of what the task involves (Example: `"Create a new repository, set up initial structure."`)
  - **status**: Current state of the task (Example: `"pending"`, `"done"`, `"deferred"`)
  - **dependencies**: IDs of prerequisite tasks (Example: `[1, 2]`)
    - Dependencies are displayed with status indicators (✅ for completed, ⏱️ for pending)
    - This helps quickly identify which prerequisite tasks are blocking work
  - **priority**: Importance level (Example: `"high"`, `"medium"`, `"low"`)
  - **details**: In-depth implementation instructions (Example: `"Use GitHub client ID/secret, handle callback, set session token."`)
  - **testStrategy**: Verification approach (Example: `"Deploy and call endpoint to confirm 'Hello World' response."`)
  - **subtasks**: List of smaller, more specific tasks (Example: `[{"id": 1, "title": "Configure OAuth", ...}]`)

- **Environment Variables Configuration**
  - **ANTHROPIC_API_KEY** (Required): Your Anthropic API key for Claude (Example: `ANTHROPIC_API_KEY=sk-ant-api03-...`)
  - **MODEL** (Default: `"claude-3-7-sonnet-20250219"`): Claude model to use (Example: `MODEL=claude-3-opus-20240229`)
  - **MAX_TOKENS** (Default: `"4000"`): Maximum tokens for responses (Example: `MAX_TOKENS=8000`)
  - **TEMPERATURE** (Default: `"0.7"`): Temperature for model responses (Example: `TEMPERATURE=0.5`)
  - **DEBUG** (Default: `"false"`): Enable debug logging (Example: `DEBUG=true`)
  - **TASKMASTER_LOG_LEVEL** (Default: `"info"`): Console output level (Example: `TASKMASTER_LOG_LEVEL=debug`)
  - **DEFAULT_SUBTASKS** (Default: `"3"`): Default subtask count (Example: `DEFAULT_SUBTASKS=5`)
  - **DEFAULT_PRIORITY** (Default: `"medium"`): Default priority (Example: `DEFAULT_PRIORITY=high`)
  - **PROJECT_NAME** (Default: `"MCP SaaS MVP"`): Project name in metadata (Example: `PROJECT_NAME=My Awesome Project`)
  - **PROJECT_VERSION** (Default: `"1.0.0"`): Version in metadata (Example: `PROJECT_VERSION=2.1.0`)
  - **PERPLEXITY_API_KEY**: For research-backed features (Example: `PERPLEXITY_API_KEY=pplx-...`)
  - **PERPLEXITY_MODEL** (Default: `"sonar-medium-online"`): Perplexity model (Example: `PERPLEXITY_MODEL=sonar-large-online`)

- **Determining the