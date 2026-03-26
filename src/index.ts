import * as core from '@actions/core'
import {getInputs} from './inputs'
import {findPRs} from './prs'
import {buildPrompt} from './prompt'
import {ensureCopilotCLI, runCopilot} from './copilot'
import {parseOutput, setOutputs} from './outputs'

async function run(): Promise<void> {
  try {
    // 1. Parse inputs
    core.info('📋 Parsing inputs...')
    const inputs = getInputs()
    core.info(
      `Comparing ${inputs.baseRef}..${inputs.headRef} using ${inputs.prStrategy} strategy`
    )

    // 2. Find PRs between refs
    core.info('🔍 Finding PRs between refs...')
    const prs = await findPRs(inputs.baseRef, inputs.headRef, inputs.prStrategy)
    if (prs.length === 0) {
      core.warning('No PRs found — nothing to generate')
      setOutputs({entries: [], uncertainEntries: [], skippedPRs: []})
      return
    }
    core.info(`Found ${prs.length} PR(s) to analyze`)

    // 3. Build the prompt
    core.info('📝 Building prompt...')
    const prompt = buildPrompt(
      prs,
      inputs.baseRef,
      inputs.headRef,
      inputs.instructionsPath
    )

    // 4. Ensure Copilot CLI is available
    core.info('🤖 Setting up Copilot CLI...')
    const copilotPath = await ensureCopilotCLI()

    // 5. Run Copilot CLI
    core.info('🚀 Running Copilot CLI...')
    const result = await runCopilot(copilotPath, prompt, inputs.model)

    // 6. Parse output and set action outputs
    core.info('📊 Parsing results...')
    const parsed = parseOutput(result.stdout)
    setOutputs(parsed)

    core.info('✅ Release notes generation complete!')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

run()
