import { NodePath } from '@babel/traverse';
import { Statement, SwitchStatement } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { ConditionalBlock } from './ConditionalBlock';
import { ControlFlowConfig } from './ControlFlowConfig';
import { Step } from './Step';
import { Transition } from './Transition';

export class ControlFlowStatement {
  public readonly startTransition: Transition;
  public readonly endTransition: Transition;
  private readonly switchStatement: NodePath<SwitchStatement>;

  private readonly steps: Step[];
  private readonly nodes: Statement[] = [];
  private readonly conditionalBlocksStack: ConditionalBlock[] = [];

  private transitionsCounter = 0;
  private _currentTransition: Transition;
  private set currentTransition(transition: Transition) {
    this._currentTransition = transition;
    this.transitionsCounter++;
  }
  private get currentTransition() {
    return this._currentTransition;
  }

  constructor(
    readonly global: GlobalState,
    { startExpression, endExpression, switchStatement }: ControlFlowConfig,
  ) {
    this.startTransition = new Transition(this, startExpression);
    this.endTransition = new Transition(this, endExpression);
    this.switchStatement = switchStatement;
    this.steps = this.switchStatement
      .get('cases')
      .map((c) => new Step(this, c));

    this._currentTransition = this.startTransition;
  }

  public getUnflattend() {
    while (
      !this.currentTransition.isEnd() ||
      this.conditionalBlocksStack.length > 0
    ) {
      if (this.transitionsCounter > 50) {
        throw new Error('Detected infinitive loop');
      }

      if (this.currentTransition.isEnd()) {
        //!
        const currentBlock = this.getCurrentBlock();
        if (currentBlock.isExecutingAlternate()) {
          //* Pop current block
          const blockStatement = currentBlock.build();
          this.conditionalBlocksStack.shift();
          this.pushNode(blockStatement);
          continue;
        } else {
          this.currentTransition = currentBlock.getAlternateTransition();
        }
        continue;
        //!
      }

      const currentStep = this.getStep(this.currentTransition);
      if (!currentStep) {
        throw new Error(
          `Couldn't find next step. ${this.currentTransition.toString()}`,
        );
      }

      //* Detect loop
      if (currentStep.isVisited) {
        this.markAsLoop(currentStep);

        //!
        const currentBlock = this.getCurrentBlock();
        if (currentBlock.isExecutingAlternate()) {
          //* Pop current block
          const blockStatement = currentBlock.build();
          this.conditionalBlocksStack.shift();
          this.pushNode(blockStatement);
          continue;
        } else {
          this.currentTransition = currentBlock.getAlternateTransition();
        }
        //!
        continue;
      }

      const { nodes, transition } = currentStep.visit();
      this.pushNode(...nodes);

      if (transition.expression?.isConditionalExpression()) {
        const conditionalBlock = new ConditionalBlock(
          currentStep,
          transition.expression,
        );
        this.conditionalBlocksStack.unshift(conditionalBlock);
        this.currentTransition = conditionalBlock.getConsequentTransition();
      } else {
        this.currentTransition = transition;
      }
    }

    return this.nodes;
  }

  private markAsLoop(step: Step) {
    const block = this.conditionalBlocksStack.find((b) => b.parentStep == step);

    if (!block) {
      throw new Error('Detected loop without a conditional block');
    }

    block.isLoop = true;
  }

  private pushNode(...nodesToPush: Statement[]) {
    const currentBlock = this.getCurrentBlock();
    if (currentBlock) {
      currentBlock.pushNode(...nodesToPush);
    } else {
      this.nodes.push(...nodesToPush);
    }
  }

  private getStep(transition: Transition) {
    return this.steps.find((s) => s.entry.isEqual(transition));
  }

  private getCurrentBlock() {
    return this.conditionalBlocksStack[0];
  }
}
