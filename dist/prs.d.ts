export interface PRInfo {
    number: number;
    title: string;
    body: string;
    author: string;
    labels: string[];
    htmlUrl: string;
}
/**
 * Find PRs between two refs using the configured strategy.
 */
export declare function findPRs(baseRef: string, headRef: string, strategy: 'merge-commits' | 'github-api'): Promise<PRInfo[]>;
