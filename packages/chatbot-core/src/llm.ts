import { LLMChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
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
        // TODO(https://github.com/oh-my-goose/investment-chatbot/issues/10):
        //  Get answer from LLM
        return Promise.resolve('deterministic answer');
    }
}
