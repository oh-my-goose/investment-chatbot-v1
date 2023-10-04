import { OpenAI } from 'langchain/llms/openai';
import { getApiKeySafely } from '@llama-flock/common-utils';
import { helloWorld } from '@llama-flock/world';

const llm = new OpenAI({
    openAIApiKey: getApiKeySafely(),
});

(async function () {
    const input = helloWorld();
    console.log({ input });
    const output = await llm.predict(input);
    console.log({ output });
})().catch((e) => {
    throw e;
});
