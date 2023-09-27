import { hello } from "@llama-flock/hello"
import { world } from '../src'

describe('hello world', () => {
  it('should output', () => {
    expect(`${hello()} ${world()}`).toBe('hello world')
  })
})
