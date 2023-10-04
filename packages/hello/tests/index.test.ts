import { hello } from '../src';

describe('hello', () => {
    it('should output', () => {
        expect(`${hello()}`).toBe('hello');
    });
});
