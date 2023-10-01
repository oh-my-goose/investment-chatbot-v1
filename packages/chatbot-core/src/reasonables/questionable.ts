import { LLMChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { ReasoningConfig } from '../configs';
import { BEING_CURIOUS_PROMPT, FINANCIAL_ADVISOR_PROMPT, FRIENDLY_WORDS_PROMPT } from '../prompts';
import { Reasonable } from '../reasonable';
import { Actionable } from './actionable';

interface AnswerAndFollowUps {
  readonly answer: string;
  readonly next_questions: string[];
}

interface QuestionableParams {
  /**
   * The new question for LLM.
   */
  readonly query: string;
  /**
   * The previous questions for LLM.
   */
  readonly previousQueries: string[];
  /**
   * Step number of follow-up questions from the root question.
   * Note: This is 0-based.
   */
  readonly depth: number;
}

export class Questionable implements Reasonable {
  readonly query: string;
  readonly previousQueries: string[];
  readonly depth: number;

  constructor({ query, previousQueries, depth }: QuestionableParams) {
    this.query = query;
    this.previousQueries = previousQueries;
    this.depth = depth;
  }

  public async question(config: ReasoningConfig): Promise<Reasonable[]> {
    const { llm, maxExploreDepth } = config;
    const questionQuota = maxExploreDepth - this.depth;

    if (questionQuota > 0) {
      const completion = await this.answerAndFollowUp(llm, questionQuota);

      return completion;
    } else {
      const compltion = await this.answerDeterministically(this.query);

      return [compltion];
    }
  }

  /**
   * Prompt LLM to be more curious about the question.
   *
   * @returns The answer and follow-up questions.
   */
  private async answerAndFollowUp(llm: OpenAI, questionQuota: number): Promise<Reasonable[]> {
    const systemPrompt = SystemMessagePromptTemplate.fromTemplate(
      [FINANCIAL_ADVISOR_PROMPT, FRIENDLY_WORDS_PROMPT].join('\n'),
    );
    const userPrompt = HumanMessagePromptTemplate.fromTemplate(BEING_CURIOUS_PROMPT(questionQuota, this.query));
    const combinedPrompt = ChatPromptTemplate.fromMessages([systemPrompt, userPrompt]);

    try {
      const chain = new LLMChain({ llm, prompt: combinedPrompt });
      const rawCompletion: string = await chain.run({});

      // Parse completion JSON
      const completion = JSON.parse(rawCompletion) as AnswerAndFollowUps;

      // Extract the deterministic answer...
      const answerAndQuestions: Reasonable[] = [
        new Actionable({
          depth: this.depth + 1,
          // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/7):
          //  Implement this
          queries: [],
          answer: completion.answer,
        }),
      ];
      // followed by underlying questions
      for (const question of completion.next_questions) {
        answerAndQuestions.push(
          new Questionable({
            query: question,
            previousQueries: [...this.previousQueries, this.query],
            depth: this.depth + 1,
          }),
        );
      }

      return answerAndQuestions;
    } catch (error) {
      // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/8):
      //  Log on crashlytics service?
      console.error(error);

      return [];
    }
  }

  /**
   * Prompt LLM to give out deterministic answers.
   *
   * @returns An actionable that may or may not have the answer.
   */
  private async answerDeterministically(query: string): Promise<Actionable> {
    // TODO: Get answer from LLM
    return new Actionable({
      depth: this.depth + 1,
      queries: [...this.previousQueries, query],
      answer: null,
    });
  }
}
