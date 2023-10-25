import { TreeLogger } from '../src/logger';

describe(`TreeLogger`, () => {
    it(`log record into a tre`, () => {
        const output = new TreeLogger()
            .withPath(['0', '1', '0'])
            .withPath(['0', '1', '1'])
            .withPath(['0', '2', '0'])
            .withPath(['0', '3', '0'])
            .withPath(['1', '1'])
            .withPath(['2'])
            .dump();
        expect(output).toEqual({
            '0': {
                '1': {
                    '0': {},
                    '1': {},
                },
                '2': {
                    '0': {},
                },
                '3': {
                    '0': {},
                },
            },
            '1': {
                '1': {},
            },
            '2': {},
        });
    });
});
