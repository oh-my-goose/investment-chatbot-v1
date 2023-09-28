import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { ReasoningConfig } from "../configs";
import { BEING_CURIOUS_PROMPT, FINANCIAL_ADVISOR_PROMPT, FRIENDLY_WORDS_PROMPT } from "../prompts";
import { Reasonable } from "../reasonable";
import { Actionable } from "./actionable";

interface QuestionableParams {
  /**
   * The question for LLM.
   */
  readonly query: string
  /**
   * 1-based
   */
  readonly depth: number
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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async reason(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ReasoningConfig,
  ): Promise<Reasonable[]> {
    const { llm, maxExploreDepth } = config

    if (this.depth < maxExploreDepth - 1) {
      const questionNumbers = maxExploreDepth - this.depth + 1
      return await this.reasonCuriously(llm, questionNumbers)
    } else {
      return [new Actionable({ depth: this.depth + 1, answer: null })]
    }

    throw new Error("TODO")
  }

  private async reasonCuriously(
    llm: OpenAI,
    questionNumbers: number,
  ): Promise<Reasonable[]> {
    const systemPrompt = SystemMessagePromptTemplate.fromTemplate([
      FINANCIAL_ADVISOR_PROMPT,
      FRIENDLY_WORDS_PROMPT,
    ].join('\n'))
    const userPrompt = HumanMessagePromptTemplate.fromTemplate(BEING_CURIOUS_PROMPT)
    const combinedPrompt = ChatPromptTemplate.fromMessages([
      systemPrompt,
      userPrompt,
    ])

    const chain = new LLMChain({ llm, prompt: combinedPrompt });
    const completion = await chain.run({
      questionNumbers,
      input: this.query,
    })

  // TODO: Parse completion (JSON) in object

    throw new Error("TODO")
  }
}