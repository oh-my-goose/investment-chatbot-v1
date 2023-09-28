
# Overview

## What

This package is set up as a mono-repo, where we can maintain different sub self-contained packages, without the need to create new repositories.

Each sub package owns its dependency closure/boundary
without being intertwined with each others.

For example, we can make one sub package for running a server,
which depends on a server library, while make another sub package for
prompt generation, which depends on langchain.

Or, one package is made for estate-related problems,
and another is made for stock-related problems.

## How

In TypeScript/JavaScript, "make file" is modeled as `package.json`.

Each package, including the mono-repo itself, and its sub package,
owns one `package.json` file.

The "make command" is modeled as "npm scripts", which are declared
in the `scripts` section of the `package.json` file.

To execute the "make command", we run `npm run <script-name>`.
Common convention of command are `build`, `test`. But any custom ones is open to add.

In a mono-repo, we can build (or test) every sub packages in one run —
`npm run build` (or `npm run build`).

Or, you can specify one sub package to run —
`npm run build-one <the directory under packages/>`.
Here, the `build-one` is another script defined in the top level `package.json` file.

# TypeScript

## Knowhow

Similar to Python, JavaScript is a transpile-base language,
which you can execute directly with a runtime (e.g the `node` command).

TypeScript, however, is a super set of JavaScript,
and it's not executable by the node runtime.

TypeScript code has to be _compiled_ into JavaScript code first, then gets executed.

That's why you see most TypeScript-based packages have a `build` script within the `package.json`.

As technology evolves, there are new runtime implementations that understand
both TypeScript and JavaScript, hence, can execute them directly,
without the hassle to build them manually.

If you really want to take the shortcut, you can install the [Bun](https://bun.sh/) runtime globally, separated from this package. When you need to execute a TypeScript
file, simply run `bun my.ts`.
