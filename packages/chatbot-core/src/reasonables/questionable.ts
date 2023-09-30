import { OpenAI, OpenAICallOptions } from "langchain/llms/openai";
import { Reasonable } from "../reasonable";

interface QuestionableParams {
  readonly query: string
  readonly depth: number
}

interface ReasonMethod {
  (llm: OpenAI<OpenAICallOptions>): Promise<Reasonable[] | never>
}

export class Questionable implements Reasonable {
  readonly query: string;
  readonly depth: number;

  constructor(
    { query, depth }: QuestionableParams,
  ) {
    this.query = query
    this.depth = depth
  }

  reason: ReasonMethod = async (llm: OpenAI<OpenAICallOptions>) => {
    throw new Error("TODO")
  }
}