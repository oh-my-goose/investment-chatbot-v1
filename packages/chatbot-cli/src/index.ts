import {
    getApiKeySafely,
    docoptCommandParser,
    CommandOptions,
    CommandArguments,
    CommandObject,
} from '@llama-flock/common-utils';
import { OpenAI } from 'langchain/llms/openai';
import { LLM, ReasoningConfig, Reasoner } from '@llama-flock/chatbot-core';
import { resolve } from 'path';

const COMMAND = resolve('dist/index.js');
const USAGE = `
USAGE:
    ${COMMAND} [--depth <depth>] --question <question>

Options:
    -d --depth=<depth>     Number of level in question derivation [default: 3]
`;
interface MyOptions extends CommandOptions {
    depth: number;
    question: string;
}
interface MyArguments extends CommandArguments {}
type MyCommandObject = CommandObject<MyArguments, MyOptions>;
(async function () {
    const cli = docoptCommandParser<MyCommandObject>(USAGE);
    const { depth, question } = cli.options;
    const openAI = new OpenAI({
        openAIApiKey: getApiKeySafely(),
    });
    const llm = new LLM({ openAI });
    const maxExploreDepth = depth;
    const config: ReasoningConfig = {
        maxExploreDepth,
        llm,
    };
    const reasoner = new Reasoner(config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const completions = await reasoner.reason(question);
    console.log({ completions });
})().catch((e) => {
    console.log(USAGE);
    console.log(e);
    process.exit(1);
});
