import { getApiKeySafely } from '@llama-flock/common-utils';
import { OpenAI } from 'langchain/llms/openai';
import { LLM, ReasoningConfig, Reasoner } from '@llama-flock/chatbot-core';

(async function () {
    const [, , ...rest] = process.argv;
    const question = rest.join(' ');
    const openAI = new OpenAI({
        openAIApiKey: getApiKeySafely(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const llm = new LLM({ openAI });
    const maxExploreDepth = 3;
    const config: ReasoningConfig = {
        maxExploreDepth,
        llm,
    };
    const reasoner = new Reasoner(config);
    const completions = await reasoner.reason(question);
    console.log({ completions });
})().catch((e) => {
    console.log(e);
    process.exit(1);
});
