import { NodePath } from '@babel/traverse';
import { Expression, PrivateName, SwitchStatement } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { ConditionalBlock } from './ConditionalBlock';
import { ControlFlowConfig } from './ControlFlowConfig';
import { Step } from './Step';

export class ControlFlowStatement {
  public readonly discriminant: NodePath<Expression>;
  public readonly initialValue: NodePath<Expression>;
  public readonly endValue: NodePath<Expression>;
  public readonly switchStatement: NodePath<SwitchStatement>;

  public readonly steps: Step[];
  public readonly nodes: NodePath<Expression>[] = [];
  public readonly blocksStack: ConditionalBlock[] = [];

  public currentTransition: NodePath<Expression>;

  constructor(
    readonly global: GlobalState,
    {
      discriminant,
      initialValue,
      endValue,
      switchStatement,
    }: ControlFlowConfig,
  ) {
    this.discriminant = discriminant;
    this.initialValue = initialValue;
    this.endValue = endValue;
    this.switchStatement = switchStatement;
    this.steps = this.switchStatement
      .get('cases')
      .map((c) => new Step(this, c));

    this.currentTransition = this.initialValue;
  }

  public traverse() {
    while (!this.areTransitionsEqual(this.currentTransition, this.endValue)) {
      console.log(this.currentTransition.toString());

      const currentStep = this.getStep(this.currentTransition);
      if (!currentStep) return;

      const { nodes, transition } = currentStep.visit();
      if (!transition.isConditionalExpression()) {
        this.currentTransition = transition;
      } else {
        return;
      }
    }
  }

  private getStep(transition: NodePath<Expression>) {
    return this.steps.find((s) => s.isEntryEqual(transition));
  }

  private areTransitionsEqual(
    left: NodePath<Expression>,
    right: NodePath<Expression>,
  ) {
    return this.global.evaluator.areEqual(left.toString(), right.toString());
  }
}
