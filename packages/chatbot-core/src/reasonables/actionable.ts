import { Completion } from "../completion";
import { ReasoningConfig } from "../configs";
import { Reasonable } from "../reasonable";

interface ActionableParams {
  readonly depth: number,
  readonly answer: string | null,
}

export class Actionable implements Reasonable {

  readonly depth: number;
  answer: string | null

  constructor(
    { depth, answer }: ActionableParams,
  ) {
    this.depth = depth
    this.answer = answer
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async action(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ReasoningConfig,
  ): Promise<Completion> {
    // TODO: Will use Langchain Router feature for that!
    return new Completion([], this.answer,)
  }
}
