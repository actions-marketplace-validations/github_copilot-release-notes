export interface ActionInputs {
    baseRef: string;
    headRef: string;
    instructionsPath: string | undefined;
    model: string | undefined;
    prStrategy: 'merge-commits' | 'github-api';
}
export declare function getInputs(): ActionInputs;
