import * as fs from 'fs'
import * as core from '@actions/core'
import {PRInfo} from './prs'

/**
 * Build the prompt for the Copilot CLI.
 *
 * The prompt includes:
 * 1. Base instructions for analyzing PRs and generating release notes
 * 2. User-provided custom instructions (team style guide)
 * 3. PR metadata (titles, bodies, labels, authors)
 * 4. Instructions for using git to explore diffs
 */
export function buildPrompt(
  prs: PRInfo[],
  baseRef: string,
  headRef: string,
  instructionsPath?: string
): string {
  const parts: string[] = []

  parts.push(buildBaseInstructions(baseRef, headRef))

  if (instructionsPath) {
    const customInstructions = loadInstructions(instructionsPath)
    if (customInstructions) {
      parts.push(buildCustomInstructionsSection(customInstructions))
    }
  }

  parts.push(buildPRSection(prs))
  parts.push(buildOutputInstructions())

  return parts.join('\n\n')
}

function buildBaseInstructions(baseRef: string, headRef: string): string {
  return `# Release Notes Generation

You are a release notes writer. Your job is to analyze the pull requests merged
between \`${baseRef}\` and \`${headRef}\` and generate user-facing release notes.

## How to Analyze PRs

For each PR listed below, you have the PR title, body, labels, and author.
You also have access to the git repository. Use \`git diff\` and \`git show\`
to examine the actual code changes when the PR title and body are insufficient
to understand the user-facing impact.

For example:
- \`git diff ${baseRef}..${headRef} -- path/to/file\` to see changes in a specific file
- \`git log --oneline ${baseRef}..${headRef}\` to see the commit history
- \`git show <commit-sha>\` to examine a specific commit

## General Guidelines

1. **Write for users, not developers** — focus on what changed from the user's perspective
2. **Be specific but concise** — include feature names, command names, or specific behaviors
3. **Use present tense** — "Add support for..." not "Added support for..."
4. **For bug fixes, describe what works now** — not what was broken
5. **Skip non-user-facing changes** — CI, tests, internal refactoring, dependency bumps
   (unless they fix security vulnerabilities or change user-visible behavior)
6. **Flag uncertainty** — if you cannot confidently categorize or summarize a PR,
   mark it with \`[???]\` so a human can review it`
}

function loadInstructions(filePath: string): string | undefined {
  try {
    if (!fs.existsSync(filePath)) {
      core.warning(`Instructions file not found: ${filePath}`)
      return undefined
    }
    return fs.readFileSync(filePath, 'utf-8').trim()
  } catch (err) {
    core.warning(`Failed to read instructions file: ${err}`)
    return undefined
  }
}

function buildCustomInstructionsSection(instructions: string): string {
  return `## Team-Specific Instructions

The following instructions describe the team's preferred format, tone,
categories, and conventions for release notes. Follow these instructions
when generating entries.

${instructions}`
}

function buildPRSection(prs: PRInfo[]): string {
  const lines = ['## Pull Requests to Analyze', '']

  for (const pr of prs) {
    lines.push(`### PR #${pr.number}: ${pr.title}`)
    lines.push(`- **Author**: @${pr.author}`)
    if (pr.labels.length > 0) {
      lines.push(`- **Labels**: ${pr.labels.join(', ')}`)
    }
    if (pr.body) {
      lines.push(`- **Body**:`)
      // Truncate very long bodies to keep prompt manageable
      const truncatedBody =
        pr.body.length > 2000
          ? pr.body.substring(0, 2000) + '\n... (truncated)'
          : pr.body
      lines.push(truncatedBody)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function buildOutputInstructions(): string {
  return `## Required Output Format

You MUST output a valid JSON object and nothing else after the final analysis.
The JSON must follow this exact structure:

\`\`\`json
{
  "entries": [
    {
      "tag": "[Fixed]",
      "description": "Concise user-facing description",
      "pr": 1234,
      "author": "username"
    }
  ],
  "uncertainEntries": [
    {
      "tag": "[???]",
      "description": "Description needing human review",
      "pr": 5678,
      "author": "username",
      "reason": "Why this entry is uncertain"
    }
  ],
  "skippedPRs": [
    {
      "pr": 9999,
      "title": "PR title",
      "reason": "Why this PR was skipped"
    }
  ]
}
\`\`\`

### Entry tags

Use these tags unless the team instructions specify different categories:
- \`[New]\` — Significant new features (use sparingly — these are release highlights)
- \`[Added]\` — Smaller features, new commands, discrete additions
- \`[Fixed]\` — Bug fixes
- \`[Improved]\` — Enhancements to existing features
- \`[Removed]\` — Removed functionality

### Important

- Every PR must appear in exactly one of: entries, uncertainEntries, or skippedPRs
- Output ONLY the JSON object — no other text before or after it
- The JSON must be valid and parseable`
}
