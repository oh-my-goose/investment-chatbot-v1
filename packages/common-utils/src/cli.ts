import { docopt } from 'docopt';
import Case from 'case';

export type CommandArguments = Record<string, boolean>;
export type CommandOptionValue = string | number | boolean;
export type CommandOptions = Record<string, CommandOptionValue>;

/** General command line info we will need */
export interface CommandObject<A, O> {
    /** All possible predefined arguments. e.g. npm (show | install | run) */
    arguments: A;
    /** All possible boolean / string options. e.g. jest `--runInBand` or jest `-t 'title'` */
    options: O;
    /** Anything after ` -- ` are treated as operands. In practical cases,
     * they are used for inner commands and should not be escaped from parsing.
     * e.g. `wrapper-of-inner.sh --wrapper-option -- "--inner-option"`
     * */
    escaped: string;
}

/** Not all command needs a sub-command or action. */
export interface SubCommandObject<A, O> extends CommandObject<A, O> {
    /**
     * The key argument to decide execution dispatching e.g. npm `run`.
     * - Validation should be considered; use SubCommandNotResolvedException to throw.
     */
    subCommand: string;
}

/** A general CommandObject used in general parser (e.g. doc-opt parser) */
export type AnyCommandObject = CommandObject<CommandArguments, CommandOptions>;

/** A general SubCommandObject used in general parser (e.g. doc-opt parser) */
export type AnySubCommandObject = SubCommandObject<CommandArguments, CommandOptions>;

/** Adapter for different solutions */
export interface CommandParser<O> {
    /**
     * Parsed process.argv result in an library-independent structure.
     * - Validation should be considered; use BadCommandException to throw.
     * - Cache should be considered.
     */
    parse: () => O | never;
    /** the usage string */
    usage: string;
}

export function spliceEscapedCommandString(): string {
    const sep = '--';
    const sepIndex = process.argv.indexOf(sep);
    if (sepIndex === -1) {
        return '';
    }
    const parts = process.argv.splice(sepIndex, process.argv.length - sepIndex);
    return parts.slice(1).join(' ');
}

export class BadCommandException extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'BadCommandException';
    }
}
export class SubCommandNotResolvedException extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'SubCommandNotResolvedException';
    }
}

type DocOpt = Record<string, string | number | boolean>;

const REGEXP_CMD_SUB_CMD = /^(?![-<]+)(.+)$/;
function parseArguments(docOptions: DocOpt): CommandArguments {
    return Object.entries(docOptions).reduce((normed: CommandArguments, [key, value]) => {
        const matches = key.match(REGEXP_CMD_SUB_CMD);
        if (matches) {
            const normedKey = Case.camel(matches[1]);
            normed[normedKey] = value as boolean;
        }
        return normed;
    }, {});
}

const REGEXP_CMD_OPT = /^(?=[-<]+)(.+)$/;
function parseOptions(docOptions: DocOpt): CommandOptions {
    return Object.entries(docOptions).reduce((normed: CommandOptions, [key, value]) => {
        const matches = key.match(REGEXP_CMD_OPT);
        if (matches) {
            const normedKey = Case.camel(matches[1]);
            normed[normedKey] = value;
        }
        return normed;
    }, {});
}

function getSubCommand(args: CommandArguments): string {
    const matches = Object.entries(args)
        .filter(([, v]) => v)
        .map(([k]) => k);
    if (matches.length !== 1) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new SubCommandNotResolvedException(`parsed arguments: ${matches}`);
    }
    return matches[0];
}

export function docoptCommandParser<T extends AnyCommandObject>(usage: string): T {
    const commandObject: T = { escaped: '', arguments: {}, options: {} } as T;
    let docOptions: DocOpt;
    try {
        commandObject.escaped = spliceEscapedCommandString();
        docOptions = docopt(usage, { exit: false });
    } catch (e) {
        throw new BadCommandException();
    }
    commandObject.arguments = parseArguments(docOptions);
    commandObject.options = parseOptions(docOptions);
    return commandObject;
}

export function docoptSubCommandParser<T extends AnySubCommandObject>(usage: string): T {
    const commandObject: T = { ...docoptCommandParser(usage), subCommand: '' } as T;
    commandObject.subCommand = getSubCommand(commandObject.arguments);
    return commandObject;
}

// Read http://docopt.org/
