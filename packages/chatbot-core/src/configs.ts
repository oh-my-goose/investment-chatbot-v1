import { LLM } from './llm';

/**
 * Global context for across reasoning processes.
 */
export interface ReasoningConfig {
    /**
     * Our own Large Language Model abstraction.
     */
    llm: LLM;
    /**
     * The knowledge exploration is traversing in a knowledge graph (or DAG). This
     * is a hard stop-condition that no more discovering beyond certain depth /
     * distance of progress.
     */
    readonly maxExploreDepth: number;
    /**
     * Instead of making an actual serp api call, make a fake response, if the flat is set
     */
    readonly suppressSerpCall?: boolean;

    // TODO: Inject a factory method that could build Questionable and Actionable.
}
