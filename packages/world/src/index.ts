import { hello } from '@llama-flock/hello';

export function world() {
    return 'world';
}

export function helloWorld() {
    return `${hello()} ${world()}!!`;
}
