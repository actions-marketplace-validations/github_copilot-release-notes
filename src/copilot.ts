import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as io from '@actions/io'

export interface CopilotResult {
  stdout: string
  exitCode: number
}

const COPILOT_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Ensure the Copilot CLI is installed and available.
 */
export async function ensureCopilotCLI(): Promise<string> {
  // Check if copilot is already available
  try {
    const copilotPath = await io.which('copilot', false)
    if (copilotPath) {
      core.info(`Copilot CLI found at: ${copilotPath}`)
      return copilotPath
    }
  } catch {
    // Not found, install it
  }

  core.info('Installing Copilot CLI via npm...')
  const exitCode = await exec.exec(
    'npm',
    ['install', '-g', '@github/copilot'],
    {silent: true}
  )

  if (exitCode !== 0) {
    throw new Error(
      'Failed to install Copilot CLI. Please ensure Node.js v22+ is available ' +
        'or install it manually before running this action.'
    )
  }

  const copilotPath = await io.which('copilot', true)
  core.info(`Copilot CLI installed at: ${copilotPath}`)
  return copilotPath
}

/**
 * Build the minimal environment for the Copilot CLI subprocess.
 * Only pass what's needed — never spread process.env which leaks secrets.
 */
function buildCopilotEnv(): Record<string, string> {
  const env: Record<string, string> = {}

  // Essentials for the process to run
  if (process.env.PATH) env.PATH = process.env.PATH
  if (process.env.HOME) env.HOME = process.env.HOME
  if (process.env.RUNNER_TEMP) env.RUNNER_TEMP = process.env.RUNNER_TEMP

  // Node.js needs these
  if (process.env.NODE_PATH) env.NODE_PATH = process.env.NODE_PATH
  if (process.env.NODE_OPTIONS) env.NODE_OPTIONS = process.env.NODE_OPTIONS

  // Auth token — prefer COPILOT_GITHUB_TOKEN, fall back to GITHUB_TOKEN
  const token =
    process.env.COPILOT_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  if (!token) {
    core.warning(
      'No COPILOT_GITHUB_TOKEN or GITHUB_TOKEN found — Copilot CLI may fail to authenticate'
    )
  }
  env.GITHUB_TOKEN = token

  return env
}

/**
 * Run the Copilot CLI with the given prompt and return the result.
 * Only grants shell(git) — no other shell tools or unrestricted file access.
 */
export async function runCopilot(
  copilotPath: string,
  prompt: string,
  model?: string
): Promise<CopilotResult> {
  core.info(`Prompt size: ${prompt.length} chars`)

  const args: string[] = [
    '--prompt',
    prompt,
    '--allow-tool',
    'shell(git)'
  ]

  if (model) {
    args.push('--model', model)
  }

  let stdout = ''
  let stderr = ''
  let timedOut = false

  // Set up a timeout to kill the process if it hangs
  const timeoutId = setTimeout(() => {
    timedOut = true
    core.error(
      `Copilot CLI timed out after ${COPILOT_TIMEOUT_MS / 1000} seconds`
    )
  }, COPILOT_TIMEOUT_MS)

  try {
    const exitCode = await exec.exec(copilotPath, args, {
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString()
        },
        stderr: (data: Buffer) => {
          stderr += data.toString()
        }
      },
      env: buildCopilotEnv()
    })

    clearTimeout(timeoutId)

    if (timedOut) {
      throw new Error(
        `Copilot CLI timed out after ${COPILOT_TIMEOUT_MS / 1000} seconds`
      )
    }

    if (exitCode !== 0) {
      core.error(`Copilot CLI exited with code ${exitCode}`)
      core.error(`stderr: ${stderr}`)
      throw new Error(`Copilot CLI failed with exit code ${exitCode}`)
    }

    return {stdout, exitCode}
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
