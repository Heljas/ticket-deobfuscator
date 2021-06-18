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
import { Transition } from './Transition';

export class ConditionalBlock {
  private readonly condition: NodePath<Expression>;
  private readonly consequentTransition: Transition;
  private readonly alternateTransition: Transition;
  private readonly consequentNodes: Statement[] = [];
  private readonly alternateNodes: Statement[] = [];

  public isLoop = false;
  private executingAlternate = false;

  constructor(
    readonly parentStep: Step,
    conditionalExpression: NodePath<ConditionalExpression>,
  ) {
    this.condition = conditionalExpression.get('test');
    this.consequentTransition = new Transition(
      parentStep.controlFlowStatement,
      conditionalExpression.get('consequent'),
    );
    this.alternateTransition = new Transition(
      parentStep.controlFlowStatement,
      conditionalExpression.get('alternate'),
    );
  }

  public pushNode(...nodes: Statement[]) {
    if (this.executingAlternate) {
      this.alternateNodes.push(...nodes);
    } else {
      this.consequentNodes.push(...nodes);
    }
  }

  public build() {
    return this.isLoop ? this.buildLoop() : this.buildIfStatement();
  }

  public getConsequentTransition() {
    return this.consequentTransition;
  }

  public getAlternateTransition() {
    this.executingAlternate = true;
    return this.alternateTransition;
  }

  public isExecutingAlternate() {
    return this.executingAlternate;
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
