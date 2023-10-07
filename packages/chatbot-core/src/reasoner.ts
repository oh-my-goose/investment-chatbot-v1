import { getApiKeySafely } from '@llama-flock/common-utils';
import { OpenAI } from 'langchain/llms/openai';
import { Completion } from './completion';
import { ReasoningConfig } from './configs';
import { LLM } from './llm';
import { Reasonable } from './reasonable';
import { Actionable, isActionable } from './reasonables/actionable';
import { Answerable } from './reasonables/answerable';
import { Questionable, isQuestionable } from './reasonables/questionable';
import { promiseAllInFlat } from './utils';

/**
 * Reasoner that takes a user question and output a compltion list. The output
 * is then processed for human readable output.
 */
export class Reasoner {
    /**
     * Global context.
     */
    protected readonly config: ReasoningConfig;

    constructor(
        config: ReasoningConfig = {
            llm: new LLM({
                openAI: new OpenAI({
                    openAIApiKey: getApiKeySafely(),
                    temperature: 0.7,
                }),
            }),
            maxExploreDepth: 3,
        },
    ) {
        if (config.maxExploreDepth < 1) {
            throw new Error(
                `Invalid maxExploreDepth(=${config.maxExploreDepth}), which must be greater than or equal to 1`,
            );
        }

        this.config = config;
    }

    public async reason(query: string): Promise<Completion[]> {
        const completions: Completion[] = [];

        // Explore resolution graph (BFS)
        const queue: Questionable[] = [new Questionable({ ask: query, queries: [], depth: 1 })];
        const visited: Set<string> = new Set([query]);
        while (queue.length > 0) {
            const node = queue.shift()!;
            // TODO: Can we parallelize the questions based on depth?
            const reasonables = await node.question(this.config);
            for (const reasonable of reasonables) {
                if (reasonable instanceof Questionable) {
                    if (visited.has(reasonable.ask)) {
                        continue;
                    }
                    queue.push(reasonable);
                    visited.add(reasonable.ask);
                } else if (reasonable instanceof Actionable) {
                    const completion = await reasonable.action(this.config);
                    completions.push(completion);
                } else if (reasonable instanceof Answerable) {
                    const completion = await reasonable.answer(this.config);
                    completions.push(completion);
                }
            }
        }

        return completions;
    }
}

export class AsyncReasoner extends Reasoner {
    public async reason(query: string): Promise<Completion[]> {
        return this.traverse(new Questionable({ ask: query, queries: [], depth: 1 }));
    }

    private triage(reasonables: Reasonable[]): { actionable?: Actionable; questionables: Questionable[] } {
        const actionable = reasonables.find(isActionable);
        const questionables = reasonables.filter(isQuestionable);
        return {
            actionable,
            questionables,
        };
    }

    private async traverse(questionable: Questionable): Promise<Completion[]> {
        return (
            questionable
                .question(this.config)
                // prettier-ignore
                .then(async (reasonables) => {
                    const { actionable, questionables } = this.triage(reasonables);
                    const ansCompletion = actionable ? [await actionable.action(this.config)] : [];
                    const nestedSubCompletions = questionables.map((q) => this.traverse(q));
                    return (
                        promiseAllInFlat(nestedSubCompletions)
                            // prettier-ignore
                            .then((flatSubCompletions) => [...ansCompletion, ...flatSubCompletions])
                    );
                })
        );
    }
}
