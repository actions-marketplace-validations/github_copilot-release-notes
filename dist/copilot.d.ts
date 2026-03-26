export interface CopilotResult {
    stdout: string;
    exitCode: number;
}
/**
 * Ensure the Copilot CLI is installed and available.
 */
export declare function ensureCopilotCLI(): Promise<string>;
/**
 * Run the Copilot CLI with the given prompt and return the result.
 * Uses child_process.spawn directly so we can enforce a real timeout
 * by killing the process if it exceeds the limit.
 */
export declare function runCopilot(copilotPath: string, prompt: string, model?: string): Promise<CopilotResult>;
