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
 * Only grants shell(git) — no other shell tools or unrestricted file access.
 */
export declare function runCopilot(copilotPath: string, prompt: string, model?: string): Promise<CopilotResult>;
