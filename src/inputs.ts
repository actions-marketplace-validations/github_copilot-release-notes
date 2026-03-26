import * as fs from 'fs'
import * as core from '@actions/core'

const DEFAULT_INSTRUCTIONS_PATH = '.github/release-notes-instructions.md'

export interface ActionInputs {
  baseRef: string
  headRef: string
  instructionsPath: string | undefined
  model: string | undefined
  prStrategy: 'merge-commits' | 'github-api'
}

export function getInputs(): ActionInputs {
  const baseRef = core.getInput('base-ref', {required: true})
  if (!baseRef) {
    throw new Error('base-ref is required')
  }

  const headRef = core.getInput('head-ref') || 'HEAD'

  const instructionsPath = resolveInstructionsPath(
    core.getInput('instructions') || undefined
  )

  const model = core.getInput('model') || undefined

  const prStrategyRaw = core.getInput('pr-strategy') || 'merge-commits'
  if (prStrategyRaw !== 'merge-commits' && prStrategyRaw !== 'github-api') {
    throw new Error(
      `Invalid pr-strategy: ${prStrategyRaw}. Must be 'merge-commits' or 'github-api'`
    )
  }

  return {
    baseRef,
    headRef,
    instructionsPath,
    model,
    prStrategy: prStrategyRaw
  }
}

/**
 * Resolve the instructions file path:
 * 1. If explicitly provided via input, use that
 * 2. Otherwise, check for .github/release-notes-instructions.md in the workspace
 * 3. If neither exists, return undefined (generic mode)
 */
function resolveInstructionsPath(
  explicit: string | undefined
): string | undefined {
  if (explicit) {
    core.info(`📖 Using explicit instructions: ${explicit}`)
    return explicit
  }

  if (fs.existsSync(DEFAULT_INSTRUCTIONS_PATH)) {
    core.info(
      `📖 Auto-discovered instructions: ${DEFAULT_INSTRUCTIONS_PATH}`
    )
    return DEFAULT_INSTRUCTIONS_PATH
  }

  core.info('📖 No custom instructions found — using generic mode')
  return undefined
}
