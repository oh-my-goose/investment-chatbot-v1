import { getApiKeySafely } from '@llama-flock/common-utils';
import { OpenAI } from 'langchain/llms/openai';
import { Completion } from './completion';
import { ReasoningConfig } from './configs';
import { Actionable } from './reasonables/actionable';
import { Questionable } from './reasonables/questionable';
import { LLM } from './llm';

/**
 * Reasoner that takes a user question and output a compltion list. The output
 * is then processed for human readable output.
 */
export class Reasoner {
  /**
   * Global context.
   */
  private readonly config: ReasoningConfig;
  /**
   * The query breadcrumbs.
   */
  private queryTrace: string[] = [];

  constructor(
    config: ReasoningConfig = {
      llm: new LLM({
        openAI: new OpenAI({
          openAIApiKey: getApiKeySafely(),
          temperature: 0.7,
        }),
      }),
      maxExploreDepth: 3,
    },
  ) {
    if (config.maxExploreDepth < 1) {
      throw new Error(`Invalid maxExploreDepth(=${config.maxExploreDepth}), which must be greater than 1`);
    }

    this.config = config;
  }

  public async reason(query: string): Promise<Completion[]> {
    const completions: Completion[] = [];

    // Explore resolution graph (BFS)
    const queue: Questionable[] = [new Questionable({ llm: this.config.llm, query, previousQueries: [], depth: 0 })];
    const visited: Set<string> = new Set([query]);
    while (queue.length > 0) {
      const node = queue.shift()!;

      // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/7):
      //  Keep track of the query trace

      // TODO: Can we parallelize the questions based on depth?
      const reasonables = await node.question(this.config);
      for (const reasonable of reasonables) {
        if (reasonable instanceof Questionable) {
          if (visited.has(reasonable.query)) {
            continue;
          }

          queue.push(reasonable);
          visited.add(reasonable.query);
        } else if (reasonable instanceof Actionable) {
          const completion = await reasonable.action(this.config);
          completions.push(completion);
        }
      }
    }

    return completions;
  }
}
