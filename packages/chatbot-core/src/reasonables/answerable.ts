import { Completion } from '../completion';
import { ReasoningConfig } from '../configs';
import { Reasonable } from '../reasonable';

interface AnswerableParams {
    /**
     * The answer given by LLM.
     */
    readonly answer: string;
    /**
     * The questions for LLM.
     */
    readonly queries: string[];
    /**
     * Step number of follow-up questions from the root question.
     * Note: This is 1-based.
     */
    readonly depth: number;
}

export class Answerable implements Reasonable {
    readonly queries: string[];
    readonly depth: number;

    private readonly _answer: string;

    constructor({ answer, queries, depth }: AnswerableParams) {
        this._answer = answer;
        this.queries = queries;
        this.depth = depth;
    }

    public async answer(_config: ReasoningConfig): Promise<Completion> {
        return new Completion(this.queries, this._answer);
    }
}
