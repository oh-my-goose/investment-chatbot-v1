import { Completion } from '../completion';
import { ReasoningConfig } from '../configs';
import { Reasonable } from '../reasonable';

interface ActionableParams {
    readonly depth: number;
    /**
     * The question trace.
     */
    readonly queries: string[];
    /**
     * The nullable answer to the end query of the queries.
     */
    readonly answer: string | null;
}

export class Actionable implements Reasonable {
    readonly depth: number;
    readonly queries: string[];
    answer: string | null;

    constructor({ depth, queries, answer }: ActionableParams) {
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
                [],
                this.answer,
            );
        }
    }

    private lastQuery(): string {
        return this.queries[this.queries.length - 1];
    }
}
