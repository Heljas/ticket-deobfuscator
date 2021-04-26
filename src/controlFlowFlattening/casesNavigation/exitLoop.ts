import { ObfuscatedBlock } from "../obfuscatedBlock";

export function exitLoop(this: ObfuscatedBlock) {
  const currentStep = this.getCurrentStep();
  const currentBlock = this.getCurrentBlock();
  if (!currentBlock) {
    console.log("[EXIT LOOP] Current block not found");
    return;
  }
  const loopAlternate = currentBlock.endCase;
  this.restoreDynamicIdentifiers();
  this.mergeBlocks();
  this.steps.push({
    case: loopAlternate,
    blocks: currentStep.blocks,
    visited: false,
    nodes: currentStep.nodes,
    isConsequent: true,
    caseNode: null
  });
}
