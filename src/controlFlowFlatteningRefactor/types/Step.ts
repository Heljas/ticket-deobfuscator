import { NodePath } from '@babel/traverse';
import { Expression, Statement, SwitchCase } from '@babel/types';
import { ControlFlowStatement } from './ControlFlowStatement';
import { Transition } from './Transition';

export class Step {
  public readonly entry: Transition;
  public readonly transition: Transition;
  private readonly nodes: Statement[];

  public isVisited = false;

  constructor(
    readonly controlFlowStatement: ControlFlowStatement,
    switchCase: NodePath<SwitchCase>,
  ) {
    this.entry = new Transition(
      this.controlFlowStatement,
      switchCase.get('test'),
    );

    const nodePaths = switchCase.get('consequent');
    const [lastBodyStatement, breakStatement] = nodePaths.splice(
      nodePaths.length - 2,
    );

    this.nodes = nodePaths.map((n) => n.node);
    if (lastBodyStatement.isReturnStatement()) {
      this.nodes.push(lastBodyStatement.node);
    }

    this.transition = this.createTransition(lastBodyStatement);
  }

  private createTransition(statement: NodePath<Statement>) {
    if (statement.isReturnStatement()) {
      return new Transition(this.controlFlowStatement, statement);
    }
    if (!statement.isExpressionStatement()) {
      throw new Error('Unexpected statement type: ' + statement.type);
    }
    const expression = statement.get('expression');
    if (!expression.isAssignmentExpression()) {
      throw new Error('Unexpected expression type: ' + expression.type);
    }
    return new Transition(this.controlFlowStatement, expression.get('right'));
  }

  public visit() {
    this.isVisited = true;
    return {
      nodes: this.nodes,
      transition: this.transition,
    };
  }
}
