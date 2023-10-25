import {
    getApiKeySafely,
    docoptCommandParser,
    CommandOptions,
    CommandArguments,
    CommandObject,
    TreeLogger,
    findUpForGitRoot,
} from '@llama-flock/common-utils';
import { OpenAI } from 'langchain/llms/openai';
import { LLM, ReasoningConfig, Reasoner } from '@llama-flock/chatbot-core';
import { resolve } from 'path';
import { format } from 'pretty-format';
import { writeFileSync } from 'fs';

const COMMAND = resolve('dist/index.js');
const USAGE = `
USAGE:
    ${COMMAND} [--depth <depth>] --question <question> [--serp <serp>] [--record <record>]

Options:
    -d --depth=<depth>          Number of level for question derivation [default: 3]
    -q --question=<question>    The initial question
    -s --serp                   Allow making serp api calls [default: true]
    -r --record=<record>        Save the query result under ./doc/examples/<record>
`;
interface MyOptions extends CommandOptions {
    depth: number;
    question: string;
    serp: boolean;
    filename: string;
}
interface MyArguments extends CommandArguments {
    record: boolean;
}
type MyCommandObject = CommandObject<MyArguments, MyOptions>;
(async function () {
    const cli = docoptCommandParser<MyCommandObject>(USAGE);
    console.log({ cli });
    const { depth, question, serp, record } = cli.options;
    const openAI = new OpenAI({
        openAIApiKey: getApiKeySafely(),
    });
    const llm = new LLM({ openAI });
    const maxExploreDepth = depth;
    const config: ReasoningConfig = {
        maxExploreDepth,
        suppressSerpCall: !serp,
        llm,
    };
    const reasoner = new Reasoner(config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const completions = await reasoner.reason(question);
    const logger = new TreeLogger();
    completions.forEach(({ queries, completion }) => {
        logger.withPath([...queries, ...(completion ? [completion] : [])]);
    });
    const output = JSON.stringify(logger.dump(), null, 2);
    console.log(output);
    if (record) {
        writeFileSync(`${findUpForGitRoot()}/docs/examples/${record}.json`, output);
    }
})().catch((e) => {
    console.log(USAGE);
    console.log(e);
    process.exit(1);
});
