import { ObfuscatedBlock } from "../obfuscatedBlock";
export function goToAlternate(this: ObfuscatedBlock) {
  const currentBlock = this.getCurrentBlock();
  const currentStep = this.getCurrentStep();
  if (!currentBlock) return;
  currentBlock.isConsequent = false;
  this.restoreDynamicIdentifiers();
  this.steps.push({
    case: currentBlock.endCase,
    blocks: currentStep.blocks,
    visited: false,
    nodes: currentStep.nodes,
    isConsequent: true,
    caseNode: null
  });
}
