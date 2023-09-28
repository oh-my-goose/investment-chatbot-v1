import { OpenAI } from "langchain/llms/openai";
import { Reasonable } from "./reasonable";
import { Questionable } from "./reasonables/questionable";
import { Actionable } from "./reasonables/actionable";

interface ReasonMethod {
    (query: string): Promise<string>
}

export class Reasoner {

    private readonly llm: OpenAI
    private readonly maxExploreDepth: number

    constructor(
        llm: OpenAI,
        maxExploreDepth: number,
    ) {
        this.llm = llm
        this.maxExploreDepth = maxExploreDepth
    }

    reason: ReasonMethod = async (
        query: string,
    ) => {
        const queue: Reasonable[] = [new Questionable({ query, depth: 1 })]
        const completions: string[] = []
        const visited: Set<string> = new Set([query])

        while (queue.length > 0) {
            const node = queue.shift()! as Questionable;
            if (node.depth > this.maxExploreDepth) {
                break
            }

            const reasonables = await node.reason(this.llm)
            for (const reasonable of reasonables) {
                if (reasonable instanceof Questionable) {
                    if (visited.has(reasonable.query)) {
                        continue
                    }

                    queue.push(reasonable)
                    visited.add(reasonable.query)
                } else if (reasonable instanceof Actionable) {
                    const completion = await reasonable.action(this.llm)
                    completions.push(completion)
                }
            }
        }

        // TODO: Consolidate ordered completions

        return "null";
    }
}
