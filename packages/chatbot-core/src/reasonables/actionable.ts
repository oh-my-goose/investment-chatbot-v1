import { Completion } from '../completion';
import { ReasoningConfig } from '../configs';
import { Reasonable } from '../reasonable';

interface ActionableParams {
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

    readonly answer: string;
}

export class Actionable implements Reasonable {
    readonly ask: string;
    readonly queries: string[];
    readonly depth: number;
    // TODO: Enforce atomicity?
    answer: string | null = null;

    constructor({ ask, queries, depth, answer }: ActionableParams) {
        this.ask = ask;
        this.depth = depth;
        this.queries = queries;

        this.answer = answer;
    }

    public async action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        config: ReasoningConfig,
    ): Promise<Completion> {
        if (this.answer === null) {
            // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/):
            //  Will use Langchain Router feature for null answer!
            throw new Error(`WIP`);
        } else {
            return new Completion(
                // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/7):
                //  Fix query traces.
                this.queries,
                this.answer,
            );
        }
    }

    private lastQuery(): string {
        return this.queries[this.queries.length - 1];
    }
}
