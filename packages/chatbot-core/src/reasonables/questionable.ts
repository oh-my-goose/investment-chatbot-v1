import { ReasoningConfig } from '../configs';
import { LLM } from '../llm';
import { Reasonable } from '../reasonable';
import { Actionable } from './actionable';

interface QuestionableParams {
  /**
   * Our own Large Language Model abstraction.
   */
  llm: LLM;
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
  readonly llm: LLM;
  readonly query: string;
  readonly previousQueries: string[];
  readonly depth: number;

  constructor({ llm, query, previousQueries, depth }: QuestionableParams) {
    this.llm = llm;
    this.query = query;
    this.previousQueries = previousQueries;
    this.depth = depth;
  }

  public async question(config: ReasoningConfig): Promise<Reasonable[]> {
    const { llm, maxExploreDepth } = config;
    const questionQuota = maxExploreDepth - this.depth;
    if (questionQuota > 1) {
      const completion = await this.answerAndFollowUp(questionQuota);

      return completion;
    } else {
      const completion = await this.answerDeterministically(this.query);

      return [completion];
    }
  }

  /**
   * Prompt LLM to be more curious about the question.
   *
   * @returns The answer and follow-up questions.
   */
  private async answerAndFollowUp(questionQuota: number): Promise<Reasonable[]> {
    try {
      // Parse completion JSON
      const completion = await this.llm.answerAsCuriousFinancialAdvisor(this.query, questionQuota);

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
            llm: this.llm,
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
    // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/10):
    //  Get answer from LLM
    return new Actionable({
      depth: this.depth + 1,
      queries: [...this.previousQueries, query],
      answer: 'deterministic answer',
    });
  }
}
