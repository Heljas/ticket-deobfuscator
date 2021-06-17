import { NodePath } from '@babel/traverse';
import { Expression, Statement, SwitchCase } from '@babel/types';
import { ControlFlowStatement } from './ControlFlowStatement';

export class Step {
  public readonly nodes: Statement[];
  public readonly entry: NodePath<Expression>;
  public readonly transition: NodePath<Expression> | null = null;
  public isVisited = false;

  private readonly hasExplicitReturn: boolean;

  constructor(
    readonly parent: ControlFlowStatement,
    readonly switchCase: NodePath<SwitchCase>,
  ) {
    this.entry = switchCase.get('test') as NodePath<Expression>;

    const nodePaths = switchCase.get('consequent');
    const [lastBodyStatement, breakStatement] = nodePaths.splice(
      nodePaths.length - 2,
    );

    this.hasExplicitReturn = lastBodyStatement.isReturnStatement();

    if (lastBodyStatement.isExpressionStatement()) {
      const expression = lastBodyStatement.get('expression');
      if (expression.isAssignmentExpression()) {
        this.transition = expression.get('right');
      }
    }

    this.nodes = nodePaths.map((n) => n.node);

    if (this.hasExplicitReturn) {
      this.nodes.push(lastBodyStatement.node);
    }
  }

  public isEntryEqual(value: NodePath<Expression>) {
    return this.parent.global.evaluator.areEqual(
      value.toString(),
      this.entry.toString(),
    );
  }

  public visit() {
    this.isVisited = true;
    return {
      nodes: this.nodes,
      transition: this.transition,
      hasExplicitReturn: this.hasExplicitReturn,
    };
  }
}
