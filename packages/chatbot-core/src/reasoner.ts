import { OpenAI } from "langchain/llms/openai";
import { Completion } from "./completion";
import { ReasoningConfig } from "./configs";
import { Actionable } from "./reasonables/actionable";
import { Questionable } from "./reasonables/questionable";
import { getApiKeySafely } from "@llama-flock/common-utils";



export class Reasoner {

    private readonly config: ReasoningConfig

    constructor(
        config: ReasoningConfig = {
            llm: new OpenAI({
                openAIApiKey: getApiKeySafely(),
                temperature: 0.7,
            }),
            maxExploreDepth: 3,
        },
    ) {
        if (config.maxExploreDepth < 1) {
            throw new Error(`Invalid maxExploreDepth(=${config.maxExploreDepth}), which must be greater than 1`)
        }

        this.config = config
    }

    public async reason(query: string): Promise<Completion[]> {
        const completions: Completion[] = []

        // Explore resolution graph (BFS)
        const queue: Questionable[] = [new Questionable({ query, depth: 1 })]
        const visited: Set<string> = new Set([query])
        const maxExploreDepth = this.config.maxExploreDepth
        while (queue.length > 0) {
            const node = queue.shift()!;
            if (node.depth > maxExploreDepth) {
                break
            }

            const reasonables = await node.reason(this.config)
            for (const reasonable of reasonables) {
                if (reasonable instanceof Questionable) {
                    if (visited.has(reasonable.query)) {
                        continue
                    }

                    queue.push(reasonable)
                    visited.add(reasonable.query)
                } else if (reasonable instanceof Actionable) {
                    const completion = await reasonable.action(this.config)
                    completions.push(completion)
                }
            }
        }

        return completions
    }
}
