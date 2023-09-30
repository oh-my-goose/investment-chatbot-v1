import { OpenAI, OpenAICallOptions } from 'langchain/llms/openai';
import { Reasonable } from '../reasonable';

interface ActionableParams {
  readonly depth: number;
}

interface ActionMethod {
  (llm: OpenAI<OpenAICallOptions>): Promise<string>;
}

export class Actionable implements Reasonable {
  readonly depth: number;

  constructor({ depth }: ActionableParams) {
    this.depth = depth;
  }

  action: ActionMethod = async (llm: OpenAI<OpenAICallOptions>) => {
    return 'TODO  ';
  };
}
