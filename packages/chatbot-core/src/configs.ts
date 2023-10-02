import { LLM } from './llm';

/**
 * Global context for across reasoning processes.
 */
export interface ReasoningConfig {
  /**
   * The OpenAI's LLM engine (via Langchain).
   */
  readonly llm: LLM;
  /**
   * The knowledge exploration is traversing in a knowledge graph (or DAG). This
   * is a hard stop-condition that no more discovering beyond certain depth /
   * distance of progress.
   */
  readonly maxExploreDepth: number;
}
