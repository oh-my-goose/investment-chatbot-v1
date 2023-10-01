/**
 * Answer given by a LLM.
 */
export class Completion {
  /**
   * @param queries The query trace leading to the completion result.
   * @param completion The answer to the end query of the queries. Note answer
   * can be null.
   */
  constructor(
    readonly queries: string[],
    readonly completion: string | null,
  ) {
    // No-op
  }
}
