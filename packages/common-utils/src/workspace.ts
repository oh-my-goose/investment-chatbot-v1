import { existsSync } from 'fs';

function findUp(shouldReturn: (cwd: string) => boolean) {
    const pathParts = process.cwd().split('/').filter(Boolean);
    while (pathParts.length) {
        const cwd = `/${pathParts.join('/')}`;
        if (shouldReturn(cwd)) {
            return cwd;
        }
        pathParts.pop();
    }
    throw new Error(`Cannot resolve from findup`);
}

export function findUpForGitRoot() {
    return findUp((cwd: string) => existsSync(`${cwd}/.git`));
}
