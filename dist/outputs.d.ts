export interface ReleaseNoteEntry {
    tag: string;
    description: string;
    pr: number;
    author: string;
}
export interface UncertainEntry extends ReleaseNoteEntry {
    reason: string;
}
export interface SkippedPR {
    pr: number;
    title: string;
    reason: string;
}
export interface ParsedOutput {
    entries: ReleaseNoteEntry[];
    uncertainEntries: UncertainEntry[];
    skippedPRs: SkippedPR[];
}
/**
 * Parse the Copilot CLI output to extract the structured JSON.
 */
export declare function parseOutput(stdout: string): ParsedOutput;
/**
 * Format release notes as markdown text.
 */
export declare function formatAsMarkdown(output: ParsedOutput): string;
/**
 * Set the GitHub Action outputs.
 */
export declare function setOutputs(output: ParsedOutput): void;
