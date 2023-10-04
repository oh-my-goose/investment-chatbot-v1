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
    readonly ask: string;
    /**
     * The previous questions for LLM.
     */
    readonly queries: string[];
    /**
     * Step number of follow-up questions from the root question.
     * Note: This is 1-based.
     */
    readonly depth: number;
}

export class Questionable implements Reasonable {
    readonly llm: LLM;
    readonly ask: string;
    readonly queries: string[];
    readonly depth: number;

    constructor({ llm, ask, queries, depth }: QuestionableParams) {
        this.llm = llm;
        this.ask = ask;
        this.queries = queries;
        this.depth = depth;
    }

    public async question(config: ReasoningConfig): Promise<Reasonable[]> {
        const { maxExploreDepth } = config;
        const remainingDepth = maxExploreDepth - this.depth;

        if (remainingDepth > 0) {
            const questionQuota = remainingDepth + 1;
            const reasonables: Reasonable[] = await this.answerAndFollowUp(questionQuota);

            return reasonables;
        } else {
            const reasonable: Reasonable = await this.answerDeterministically();

            return [reasonable];
        }
    }

    /**
     * Prompt LLM to be more curious about the question.
     *
     * @returns The answer and follow-up questions.
     */
    private async answerAndFollowUp(questionQuota: number): Promise<Reasonable[]> {
        const queries = [...this.queries, this.ask];
        try {
            // Parse completion JSON
            const completion = await this.llm.answerAsCuriousFinancialAdvisor(this.ask, questionQuota);

            // Extract the deterministic answer...
            const answerAndQuestions: Reasonable[] = [
                new Actionable({
                    depth: this.depth + 1,
                    // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/7):
                    //  Implement this
                    queries,
                    answer: completion.answer,
                }),
            ];
            // followed by underlying questions
            for (const question of completion.next_questions) {
                answerAndQuestions.push(
                    new Questionable({
                        llm: this.llm,
                        ask: question,
                        queries,
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
    private async answerDeterministically(): Promise<Actionable> {
        const queries = [...this.queries, this.ask];
        // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/10):
        //  Get answer from LLM
        return new Actionable({
            depth: this.depth + 1,
            queries,
            answer: 'deterministic answer',
        });
    }
}
