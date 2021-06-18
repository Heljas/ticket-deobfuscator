import { NodePath } from '@babel/traverse';
import { Expression, ReturnStatement } from '@babel/types';
import { ControlFlowStatement } from './ControlFlowStatement';

export class Transition {
  public expression: NodePath<Expression> | null = null;
  public isReturnStatement: boolean;

  constructor(
    private readonly controlFlowStatement: ControlFlowStatement,
    private readonly path: NodePath<
      Expression | ReturnStatement | null | undefined
    >,
  ) {
    this.isReturnStatement = path.isReturnStatement();

    if (path.isExpression()) {
      this.expression = path;
    }
  }

  public isEqual(other: Transition) {
    if (!this.expression) {
      throw new Error(`${this.path.toString()} is return statement!`);
    }
    if (!other.expression) {
      throw new Error(`${other.path.toString()} is return statement!`);
    }
    return this.controlFlowStatement.global.evaluator.areEqual(
      this.expression.toString(),
      other.expression.toString(),
    );
  }

  public isEnd() {
    return (
      this.isReturnStatement ||
      this.isEqual(this.controlFlowStatement.endTransition)
    );
  }

  public toString() {
    return `[Transition] ${this.path.toString()}`;
  }
}
