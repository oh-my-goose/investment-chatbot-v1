import { Completion } from '../completion';
import { ReasoningConfig } from '../configs';
import { LLM } from '../llm';
import { Reasonable } from '../reasonable';

interface ActionableParams {
    /**
     * The question to be resolved.
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

export class Actionable implements Reasonable {
    readonly ask: string;
    readonly queries: string[];
    readonly depth: number;

    constructor({ ask, queries, depth }: ActionableParams) {
        this.ask = ask;
        this.queries = queries;
        this.depth = depth;
    }

    public async action(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        config: ReasoningConfig,
    ): Promise<Completion> {
        const { llm } = config;
        const answer = await llm.answerAsDeterministicFinancialAdvisor(this.ask);

        const fullQueries = [...this.queries, this.ask];
        return new Completion(fullQueries, answer);
    }
}

export function isActionable(input: any): input is Actionable {
    return input instanceof Actionable;
}
