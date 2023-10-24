import { getApiKeySafely } from '../src/env';

describe(`getApiKeySafely`, () => {
    let saved = '';
    beforeAll(() => {
        saved = process.env.OPENAI_API_KEY || '';
    });
    afterAll(() => {
        process.env.OPENAI_API_KEY = saved;
    });
    it(`should fail if environment is not given`, () => {
        process.env.OPENAI_API_KEY = '';
        expect(() => getApiKeySafely()).toThrow();
    });
    it(`should resolve if environment is given`, () => {
        process.env.OPENAI_API_KEY = 'key';
        expect(getApiKeySafely()).toBe('key');
    });
});
