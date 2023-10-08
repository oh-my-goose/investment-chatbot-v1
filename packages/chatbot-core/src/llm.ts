import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { BEING_CURIOUS_PROMPT, FINANCIAL_ADVISOR_PROMPT, FRIENDLY_WORDS_PROMPT } from './prompts';

/**
 * LLM constructor key-value parameters.
 */
interface Params {
    /**
     * The OpenAI's LLM engine (via Langchain).
     */
    readonly openAI: OpenAI;
}

export interface AnswerAndFollowUps {
    readonly answer: string;
    readonly next_questions: string[];
}

export class LLM {
    private readonly openAI: OpenAI;

    constructor({ openAI: llm }: Params) {
        this.openAI = llm;
    }

    async answerAsCuriousFinancialAdvisor(query: string, questionQuota: number): Promise<AnswerAndFollowUps> {
        const systemPrompt = SystemMessagePromptTemplate.fromTemplate(
            [FINANCIAL_ADVISOR_PROMPT, FRIENDLY_WORDS_PROMPT].join('\n'),
        );

        const userPrompt = HumanMessagePromptTemplate.fromTemplate(BEING_CURIOUS_PROMPT(questionQuota, query));
        const combinedPrompt = ChatPromptTemplate.fromMessages([systemPrompt, userPrompt]);

        const llm = this.openAI;
        const chain = new LLMChain({ llm, prompt: combinedPrompt });
        const rawCompletion: string = await chain.run({});

        // Parse completion JSON
        const completion = JSON.parse(rawCompletion) as AnswerAndFollowUps;

        return completion;
    }

    async answerAsDeterministicFinancialAdvisor(query: string): Promise<string> {
        const tools = [new Calculator(), new SerpAPI()];
        const chat = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0 });

        const executor = await initializeAgentExecutorWithOptions(tools, chat, {
            agentType: 'openai-functions',
            verbose: true,
        });

        const result = await executor.run(query);
        return result;
    }
}
