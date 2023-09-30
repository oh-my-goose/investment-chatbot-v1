import { getApiKeySafely } from '../src';

describe(`getApiKeySafely`, () => {
  it(`should fail if environment is not given`, () => {
    expect(() => getApiKeySafely()).toThrow();
  });
});
