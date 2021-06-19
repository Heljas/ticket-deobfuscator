import { NodePath } from '@babel/traverse';
import {
  blockStatement,
  ConditionalExpression,
  Expression,
  Statement,
  whileStatement,
  ifStatement,
  isNodesEquivalent,
  isReturnStatement,
} from '@babel/types';
import { Step } from './Step';
import { Transition } from './Transition';

export class ConditionalBlock {
  private readonly condition: NodePath<Expression>;
  private readonly consequentTransition: Transition;
  private readonly alternateTransition: Transition;
  private readonly consequentNodes: Statement[] = [];
  private readonly alternateNodes: Statement[] = [];

  private isLoop = false;
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

  public build() {
    return this.isLoop ? this.buildLoop() : this.buildIfStatement();
  }

  public markAsLoop() {
    this.isLoop = true;
  }

  private buildLoop() {
    const block = blockStatement(this.consequentNodes);
    return [whileStatement(this.condition.node, block), ...this.alternateNodes];
  }

  private buildIfStatement() {
    if (this.alternateNodes.length == 0) {
      const consequent = blockStatement(this.consequentNodes);
      return [ifStatement(this.condition.node, consequent)];
    }

    const reversedAlternate = [...this.alternateNodes].reverse();
    const reversedConsequent = [...this.consequentNodes].reverse();
    const duplicatedNodes: Statement[] = [];

    for (
      let i = 0;
      i < reversedAlternate.length && i < reversedConsequent.length;
      i++
    ) {
      if (!isNodesEquivalent(reversedAlternate[i], reversedConsequent[i]))
        break;
      duplicatedNodes.push(reversedAlternate[i]);
    }
    duplicatedNodes.reverse();

    const n = duplicatedNodes.length;
    this.consequentNodes.splice(this.consequentNodes.length - n, n);
    this.alternateNodes.splice(this.alternateNodes.length - n, n);

    const consequent = blockStatement(this.consequentNodes);
    const lastConsequentNode = this.consequentNodes[
      this.consequentNodes.length - 1
    ];
    if (isReturnStatement(lastConsequentNode)) {
      return [
        ifStatement(this.condition.node, consequent),
        ...this.alternateNodes,
      ];
    }

    const alternate =
      this.alternateNodes.length > 0
        ? blockStatement(this.alternateNodes)
        : null;

    return [
      ifStatement(this.condition.node, consequent, alternate),
      ...duplicatedNodes,
    ];
  }
}
