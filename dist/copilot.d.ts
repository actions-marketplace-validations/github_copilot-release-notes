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
 */
export declare function runCopilot(copilotPath: string, prompt: string, model?: string): Promise<CopilotResult>;
