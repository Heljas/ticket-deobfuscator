import { NodePath } from '@babel/traverse';
import { FIND_NEXT_CASE } from './findNextCase';
import { ObfuscatedBlock } from '../obfuscatedBlock';

export function followPath(this: ObfuscatedBlock) {
  let currentStep = this.getCurrentStep();

  if (currentStep.visited && currentStep.blocks.length === 0) return;

  const foundCase = this.cases.find((c: NodePath) =>
    this.globalState.evaluator.areEqual(c.get('test').toString(), currentStep.case),
  );

  if (!foundCase || (currentStep.visited && currentStep.blocks.length > 0)) {
    while (currentStep.blocks[0] && !currentStep.blocks[0].isConsequent) {
      this.mergeBlocks();
    }
    const currentBlock = this.getCurrentBlock();
    if (currentBlock && currentBlock.isConsequent) {
      this.goToAlternate();
      this.followPath();
    }
    return;
  }

  currentStep.caseNode = foundCase;
  this.addToContainer();

  currentStep.caseNode.traverse<ObfuscatedBlock>(FIND_NEXT_CASE, this);
  currentStep.visited = true;

  if (this.steps.length > 1000) {
    console.log('call stack');
    return;
  }
  this.followPath();
}
