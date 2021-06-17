import { NodePath } from '@babel/traverse';
import {
  Expression,
  PrivateName,
  Statement,
  SwitchStatement,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { ConditionalBlock } from './ConditionalBlock';
import { ControlFlowConfig } from './ControlFlowConfig';
import { Step } from './Step';

export class ControlFlowStatement {
  public readonly discriminant: NodePath<Expression>;
  public readonly startTransition: NodePath<Expression>;
  public readonly endTransition: NodePath<Expression>;
  public readonly switchStatement: NodePath<SwitchStatement>;

  public readonly steps: Step[];
  public readonly nodes: Statement[] = [];
  public readonly blocksStack: ConditionalBlock[] = [];

  private _currentTransition: NodePath<Expression>;

  private set currentTransition(transition: NodePath<Expression>) {
    this._currentTransition = transition;
    this.transitionsCounter++;
  }

  private get currentTransition() {
    return this._currentTransition;
  }

  private transitionsCounter = 0;

  constructor(
    readonly global: GlobalState,
    {
      discriminant,
      startTransition,
      endTransition,
      switchStatement,
    }: ControlFlowConfig,
  ) {
    this.discriminant = discriminant;
    this.startTransition = startTransition;
    this.endTransition = endTransition;
    this.switchStatement = switchStatement;
    this.steps = this.switchStatement
      .get('cases')
      .map((c) => new Step(this, c));

    this._currentTransition = this.startTransition;
  }

  public getUnflattend() {
    let reachedEnd = false;
    while (!reachedEnd || this.blocksStack.length > 0) {
      if (this.transitionsCounter > 50) {
        console.log('Detected infinitive loop');
        return;
      }

      if (reachedEnd) {
        const currentBlock = this.getCurrentBlock();
        console.log('reached end' + this.currentTransition.toString());

        if (currentBlock.inConsequent) {
          this.currentTransition = currentBlock.alternateTransition;
          currentBlock.inConsequent = false;

          reachedEnd = this.areTransitionsEqual(
            this.currentTransition,
            this.endTransition,
          );
        } else {
          //push to itself error
          //* Pop current block
          const blockStatement = currentBlock.build();
          this.blocksStack.shift();
          this.pushNode(blockStatement);
          continue;
        }
      }

      console.log(this.currentTransition.toString());

      const currentStep = this.getStep(this.currentTransition);
      if (!currentStep) return;

      //* Detect loop
      if (currentStep.isVisited) {
        const currentBlock = this.getCurrentBlock();
        console.log('Detected loop');

        if (!currentBlock) {
          console.log('Detected loop without a conditional block');
          return;
        }

        if (!currentStep.transition) {
          console.log('Detected loop without a transition');
          return;
        }

        this.markAsLoop(currentStep);

        //check if consequent

        if (currentBlock.inConsequent) {
          this.currentTransition = currentBlock.alternateTransition;
          currentBlock.inConsequent = false;

          console.log('Current block ' + currentBlock.condition.toString());

          reachedEnd = this.areTransitionsEqual(
            this.currentTransition,
            this.endTransition,
          );
        } else {
          //* Pop current block
          const blockStatement = currentBlock.build();
          this.blocksStack.shift();
          this.pushNode(blockStatement);
          continue;
        }

        continue;
      }

      const { nodes, transition, hasExplicitReturn } = currentStep.visit();
      this.pushNode(...nodes);

      if (transition) {
        if (transition.isConditionalExpression()) {
          const conditionalBlock = new ConditionalBlock(
            currentStep,
            transition,
          );
          console.log(transition.toString());
          this.blocksStack.unshift(conditionalBlock);
          this.currentTransition = conditionalBlock.consequentTransition;
        } else {
          this.currentTransition = transition;
        }
      }

      reachedEnd =
        hasExplicitReturn ||
        this.areTransitionsEqual(this.currentTransition, this.endTransition);
    }

    return this.nodes;
  }

  private markAsLoop(step: Step) {
    const block = this.blocksStack.find((b) => b.entryStep == step);

    if (!block) {
      console.log('Detected loop without a conditional block');
      return;
    }

    console.log('Marked as loop ' + block.condition.toString());

    block.isLoop = true;
  }

  private pushNode(...nodesToPush: Statement[]) {
    const currentBlock = this.getCurrentBlock();
    if (currentBlock) {
      console.log(
        `pushing ${nodesToPush.length} to` + currentBlock.condition.toString(),
      );
      currentBlock.pushNode(...nodesToPush);
    } else {
      console.log(`pushing ${nodesToPush.length} to global`);
      this.nodes.push(...nodesToPush);
    }
  }

  private getStep(transition: NodePath<Expression>) {
    return this.steps.find((s) => s.isEntryEqual(transition));
  }

  private getCurrentBlock() {
    return this.blocksStack[0];
  }

  private areTransitionsEqual(
    left: NodePath<Expression>,
    right: NodePath<Expression>,
  ) {
    return this.global.evaluator.areEqual(left.toString(), right.toString());
  }
}
//* 1. Return + consequent -> go to alt

//* 2. Return + alt ->
//*                   - blocks > 0 = pop block
//*                   - blocks == 0 = finish

//* 3. endTransition + consequent -> go to alt

//* 4. endTransition + alt ->
//*                   - blocks > 0 = pop block
//*                   - blocks == 0 = finish
