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