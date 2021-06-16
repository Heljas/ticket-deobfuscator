import { NodePath } from '@babel/traverse';
import { Expression, Statement, SwitchCase } from '@babel/types';
import { ControlFlowStatement } from './ControlFlowStatement';

export class Step {
  public readonly transition: NodePath<Expression>;
  public readonly nodes: NodePath<Statement>[];
  public readonly entry: NodePath<Expression>;
  public isVisited = false;

  constructor(
    readonly parent: ControlFlowStatement,
    readonly switchCase: NodePath<SwitchCase>,
  ) {
    const nodes = switchCase.get('consequent');

    const [discriminantStatement, breakStatement] = nodes.splice(
      nodes.length - 2,
    );

    const transition = discriminantStatement.get(
      'expression.right',
    ) as NodePath<Expression>;

    this.nodes = nodes;
    this.transition = transition;
    this.entry = switchCase.get('test') as NodePath<Expression>;
  }

  public isEntryEqual(value: NodePath<Expression>) {
    return this.parent.global.evaluator.areEqual(
      value.toString(),
      this.entry.toString(),
    );
  }

  public visit() {
    this.isVisited = true;
    return { nodes: this.nodes, transition: this.transition };
  }
}
