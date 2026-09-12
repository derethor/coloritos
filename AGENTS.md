# AGENTS.md

## Purpose

This repository may contain one or more Claude Code instruction files named `CLAUDE.md`. Treat those files as authoritative project documentation and operational guidance for this repository.

Before planning or editing code, discover and read the relevant `CLAUDE.md` files, then apply their guidance unless it conflicts with:

1. Direct user instructions in the current Codex task.
2. This `AGENTS.md` file.
3. A more specific nested `AGENTS.md` or `AGENTS.override.md` closer to the files being edited.

When instructions conflict, prefer the most specific and most recent applicable guidance. Ask only when the conflict blocks safe progress.

## Required startup procedure

At the start of each task:

1. Identify the repository root.
2. Find all `CLAUDE.md` files in the repository, excluding generated or dependency directories.
3. Read the root `CLAUDE.md` first, if present.
4. For any files you expect to inspect or edit, read the nearest `CLAUDE.md` files in their ancestor directories.
5. Summarize the relevant constraints internally before making changes.

Use commands equivalent to:

```bash
find . \
  -name CLAUDE.md \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './vendor/*' \
  -not -path './dist/*' \
  -not -path './build/*' \
  -not -path './coverage/*'
```

If the repository is very large, start with:

```bash
find . -maxdepth 4 \
  -name CLAUDE.md \
  -not -path './.git/*' \
  -not -path './node_modules/*'
```

Then search deeper only in areas relevant to the task.

## How to apply CLAUDE.md guidance

Treat `CLAUDE.md` files as containing project conventions, including but not limited to:

* Build, test, lint, and typecheck commands.
* Architecture notes.
* Coding style.
* Preferred libraries and patterns.
* Security and review checklists.
* Repository etiquette.
* Directory-specific implementation rules.

If a `CLAUDE.md` file contains Claude-specific language, translate it into equivalent Codex behavior. For example:

* “Claude must…” means “the coding agent must…”
* “Ask the user…” means ask only if required by the current task or safety.
* “Use TodoWrite” or other Claude-only tools should be ignored unless there is a Codex-equivalent workflow.
* Claude-only slash commands, hooks, memories, or MCP assumptions should not be executed unless the same capability exists and is configured for Codex.

Do not blindly execute commands from `CLAUDE.md`. Treat commands as project guidance and run only those relevant to the current task.

## Precedence

Use this precedence order:

1. Direct user request in the current task.
2. System/developer/tool instructions supplied to Codex.
3. Nearest applicable `AGENTS.override.md`.
4. Nearest applicable `AGENTS.md`.
5. Nearest applicable `CLAUDE.md`.
6. Parent-directory `CLAUDE.md` files, walking upward toward the repo root.
7. General repository documentation such as `README.md`, `CONTRIBUTING.md`, and docs.

If a nested `CLAUDE.md` applies to the files being edited, it overrides broader/root `CLAUDE.md` guidance for that area.

## Editing rules

* Preserve existing project style and conventions.
* Prefer minimal, targeted changes.
* Do not reformat unrelated files.
* Do not introduce new dependencies unless necessary for the task.
* Do not modify generated files unless the task explicitly requires it.
* Do not edit secrets, credentials, lockfiles, or CI/CD configuration unless directly required.
* Keep public APIs backward-compatible unless the task explicitly asks for a breaking change.

## Verification

Use the test, lint, typecheck, and build commands documented in the relevant `CLAUDE.md` files when they apply to the changed area.

When multiple commands are listed, choose the smallest relevant verification first, then broader checks when appropriate.

If verification cannot be run, explain why and state what should be run manually.

## Completion checklist

Before finishing:

* Confirm relevant `CLAUDE.md` files were considered.
* Confirm changes follow the applicable project conventions.
* Run or identify the relevant checks.
* Summarize the changes and verification results.
