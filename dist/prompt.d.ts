import { PRInfo } from './prs';
/**
 * Build the prompt for the Copilot CLI.
 *
 * The prompt includes:
 * 1. Base instructions for analyzing PRs and generating release notes
 * 2. User-provided custom instructions (team style guide)
 * 3. PR metadata (titles, bodies, labels, authors)
 * 4. Instructions for using git to explore diffs
 */
export declare function buildPrompt(prs: PRInfo[], baseRef: string, headRef: string, instructionsPath?: string): string;
