import { ReasoningConfig } from '../configs';
import { LLM } from '../llm';
import { Reasonable } from '../reasonable';
import { Actionable } from './actionable';
import { Answerable } from './answerable';

interface QuestionableParams {
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
    readonly ask: string;
    readonly queries: string[];
    readonly depth: number;

    constructor({ ask, queries, depth }: QuestionableParams) {
        this.ask = ask;
        this.queries = queries;
        this.depth = depth;
    }

    public async question(config: ReasoningConfig): Promise<Reasonable[]> {
        const { maxExploreDepth } = config;
        const remainingDepth = maxExploreDepth - this.depth;

        if (remainingDepth > 0) {
            const questionQuota = remainingDepth + 1;
            const reasonables: Reasonable[] = await this.answerAndFollowUp(questionQuota, config);

            return reasonables;
        } else {
            const reasonable: Reasonable = await this.answerDeterministically(config);

            return [reasonable];
        }
    }

    /**
     * Prompt LLM to be more curious about the question.
     *
     * @returns The answer and follow-up questions.
     */
    private async answerAndFollowUp(questionQuota: number, config: ReasoningConfig): Promise<Reasonable[]> {
        const { llm } = config;

        const queries = [...this.queries, this.ask];
        try {
            // Parse completion JSON
            const completion = await llm.answerAsCuriousFinancialAdvisor(this.ask, questionQuota);

            const answerAndQuestions: Reasonable[] = [];
            if (completion.next_questions.length > 0) {
                for (const question of completion.next_questions) {
                    answerAndQuestions.push(
                        new Questionable({
                            ask: question,
                            queries,
                            depth: this.depth + 1,
                        }),
                    );
                }
            }
            // followed by underlying questions

            return answerAndQuestions;
        } catch (error) {
            // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/8):
            //  Log on crashlytics service?
            console.error(error);

            return [];
        }
    }

    /**
     * @returns An actionable that will provider a deterministic answer.
     */
    private async answerDeterministically(_config: ReasoningConfig): Promise<Actionable> {
        return new Actionable({
            ask: this.ask,
            queries: this.queries,
            depth: this.depth + 1,
        });
    }
}

export function isQuestionable(input: any): input is Questionable {
    return input instanceof Questionable;
}
