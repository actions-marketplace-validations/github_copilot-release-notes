import * as core from '@actions/core'

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

  const instructionsPath = core.getInput('instructions') || undefined

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
