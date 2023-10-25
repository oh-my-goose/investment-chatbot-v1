import {
    docoptCommandParser,
    docoptSubCommandParser,
    CommandArguments,
    CommandOptions,
    CommandObject,
    SubCommandObject,
    BadCommandException,
} from '../src/cli';

interface MyArguments extends CommandArguments {
    answer: boolean;
}

interface MyOptions extends CommandOptions {
    depth: number;
    question: string;
}

type MyCommandObject = CommandObject<MyArguments, MyOptions>;
type MySubCommandObject = SubCommandObject<MyArguments, MyOptions>;
const COMMAND = 'index.js';

describe(`docoptCommandParser`, () => {
    let saved: string[] = [];
    beforeAll(() => {
        saved = process.argv;
    });
    afterAll(() => {
        process.argv = saved;
    });

    it(`should parse command`, () => {
        process.argv = ['node', COMMAND, 'answer', '--depth', '3', '--question', 'how to...', '--', 'blah'];
        const USAGE = `USAGE:
            ${COMMAND} answer [--depth <depth>] --question <question>`;
        const parsed = docoptCommandParser<MyCommandObject>(USAGE);
        expect(parsed.arguments.answer).toBeTruthy();
        expect(parsed.options.depth).toBe(3);
        expect(parsed.options.question).toBe('how to...');
        expect(parsed.escaped).toBe('blah');
    });

    it(`should parse sub command`, () => {
        process.argv = ['node', COMMAND, 'answer', '--depth', '3', '--question', 'how to...', '--', 'blah'];
        const USAGE = `USAGE:
            ${COMMAND} answer [--depth <depth>] --question <question>`;
        const parsed = docoptSubCommandParser<MySubCommandObject>(USAGE);
        expect(parsed.subCommand).toBe('answer');
        expect(parsed.options.depth).toBe(3);
        expect(parsed.options.question).toBe('how to...');
        expect(parsed.escaped).toBe('blah');
    });

    it(`should skip optional`, () => {
        process.argv = ['node', COMMAND, 'answer', '--question', 'how to...', '--', 'blah'];
        const USAGE = `
        USAGE:
            ${COMMAND} answer [--depth <depth>] --question <question>

        Options:
            --depth=<depth>     Number of level in question derivation [default: 3]
        `;
        const parsed = docoptSubCommandParser<MySubCommandObject>(USAGE);
        expect(parsed.subCommand).toBe('answer');
        expect(parsed.options.depth).toBe(3);
        expect(parsed.options.question).toBe('how to...');
        expect(parsed.escaped).toBe('blah');
    });

    it(`should throw if required is missing`, () => {
        process.argv = ['node', COMMAND, 'answer'];
        const USAGE = `USAGE:
            ${COMMAND} answer [--depth <depth>] --question <question>`;
        expect(() => docoptSubCommandParser<MySubCommandObject>(USAGE)).toThrow(BadCommandException);
    });
});
