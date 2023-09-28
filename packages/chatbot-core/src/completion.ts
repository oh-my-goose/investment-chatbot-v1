export class Completion {

  constructor(
    readonly queries: string[],
    readonly completion: string | null,
  ) {
    // No-op
  }
}