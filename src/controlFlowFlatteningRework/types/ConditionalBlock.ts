import { NodePath } from '@babel/traverse';
import {
  blockStatement,
  ConditionalExpression,
  Expression,
  Statement,
  whileStatement,
  ifStatement,
} from '@babel/types';
import { Step } from './Step';

export class ConditionalBlock {
  public readonly condition: NodePath<Expression>;
  public readonly consequentTransition: NodePath<Expression>;
  public readonly alternateTransition: NodePath<Expression>;
  public readonly consequentNodes: Statement[] = [];
  public readonly alternateNodes: Statement[] = [];
  public inConsequent = true;
  public isLoop = false;

  constructor(
    readonly entryStep: Step,
    conditionalTransition: NodePath<ConditionalExpression>,
  ) {
    this.condition = conditionalTransition.get('test');
    this.consequentTransition = conditionalTransition.get('consequent');
    this.alternateTransition = conditionalTransition.get('alternate');
  }

  public pushNode(...nodes: Statement[]) {
    if (this.inConsequent) {
      this.consequentNodes.push(...nodes);
    } else {
      this.alternateNodes.push(...nodes);
    }
  }

  public build() {
    return this.isLoop ? this.buildLoop() : this.buildIfStatement();
  }

  private buildLoop() {
    const block = blockStatement(this.consequentNodes);
    return whileStatement(this.condition.node, block);
  }

  private buildIfStatement() {
    const consequent = blockStatement(this.consequentNodes);
    if (this.alternateNodes.length > 0) {
      const alternate = blockStatement(this.alternateNodes);
      return ifStatement(this.condition.node, consequent, alternate);
    }
    return ifStatement(this.condition.node, consequent);
  }
}
