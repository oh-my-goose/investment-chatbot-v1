import { OpenAI } from 'langchain/llms/openai';
import { Reasoner } from '../src/reasoner';
import { ReasoningConfig } from '../src/configs';
import { LLM } from '../src/llm';

const llm = new LLM({ openAI: jest.fn() as unknown as OpenAI });
const mockedLlmEntry = jest.spyOn(llm, 'answerAsCuriousFinancialAdvisor');
mockedLlmEntry.mockImplementation((query, questionQuota) => {
    const answer = `${query}-ans`;
    const questions = Array.from({ length: questionQuota }).map((_, idx) => {
        return `${query}-q${idx + 1}`;
    });
    return Promise.resolve({
        answer,
        next_questions: questions,
    });
});

describe(`Reasoner`, () => {
    const INITIAL_QUESTION = 'question';
    const DETERMINISTIC_ANSWER = 'deterministic answer';

    it(`should answer deterministically if max depth is 1`, async () => {
        const maxExploreDepth = 1;
        const config: ReasoningConfig = {
            maxExploreDepth,
            llm,
        };
        const answerOfDepth0 = DETERMINISTIC_ANSWER;
        const expected = [answerOfDepth0];

        const reasoner = new Reasoner(config);
        const completions = await reasoner.reason(INITIAL_QUESTION);

        expect(completions.map(({ completion }) => completion)).toEqual(expected);
    });

    it(`should answer with questions if max depth is 2`, async () => {
        const maxExploreDepth = 2;
        const config: ReasoningConfig = {
            maxExploreDepth,
            llm,
        };
        const answerOfDepth0 = `${INITIAL_QUESTION}-ans`;
        const answerOfDepth1 = Array(2).fill(DETERMINISTIC_ANSWER);
        const expected = [answerOfDepth0, ...answerOfDepth1];

        const reasoner = new Reasoner(config);
        const completions = await reasoner.reason(INITIAL_QUESTION);

        expect(completions.map(({ completion }) => completion)).toEqual(expected);
    });

    it(`should answer with questions if max depth is 3`, async () => {
        const maxExploreDepth = 3;
        const config: ReasoningConfig = {
            maxExploreDepth,
            llm,
        };
        const answerOfDepth0 = `${INITIAL_QUESTION}-ans`;
        const answerOfDepth1 = Array(3)
            .fill(`${INITIAL_QUESTION}-q-ans`)
            .map((a: string, idx) => {
                return a.replace('-q-', `-q${idx + 1}-`);
            });
        const answerOfDepth2 = [
            ...Array(2).fill(DETERMINISTIC_ANSWER),
            ...Array(2).fill(DETERMINISTIC_ANSWER),
            ...Array(2).fill(DETERMINISTIC_ANSWER),
        ];
        const expected = [answerOfDepth0, ...answerOfDepth1, ...answerOfDepth2];

        const reasoner = new Reasoner(config);
        const completions = await reasoner.reason(INITIAL_QUESTION);

        expect(completions.map(({ completion }) => completion)).toEqual(expected);
    });

    it(`should trace query history for each completion`, async () => {
        const maxExploreDepth = 3;
        const config: ReasoningConfig = {
            maxExploreDepth,
            llm,
        };
        // XXX probably not worth to auto gen these
        const queriesOfDepth0 = [INITIAL_QUESTION];
        const queriesOfDepth1 = [
            [...queriesOfDepth0, 'question-q1'],
            [...queriesOfDepth0, 'question-q2'],
            [...queriesOfDepth0, 'question-q3'],
        ];
        const queriesOfDepth2 = [
            [...queriesOfDepth1[0], 'question-q1-q1'],
            [...queriesOfDepth1[0], 'question-q1-q2'],
            [...queriesOfDepth1[1], 'question-q2-q1'],
            [...queriesOfDepth1[1], 'question-q2-q2'],
            [...queriesOfDepth1[2], 'question-q3-q1'],
            [...queriesOfDepth1[2], 'question-q3-q2'],
        ];
        const expected = [queriesOfDepth0, ...queriesOfDepth1, ...queriesOfDepth2];

        const reasoner = new Reasoner(config);
        const completions = await reasoner.reason(INITIAL_QUESTION);

        expect(completions.map(({ queries }) => queries)).toEqual(expected);
    });
});
